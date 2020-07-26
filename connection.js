const config = {iceServers: [{urls: "stun:stun.l.google.com:19302"}]};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("from me to you", {negotiated: true, id: 0});
const log = msg => div.innerHTML += `<br>${msg}`;


var party = $("#offer_party").val();

var file_to_send = null;

var receive_filename;
var receive_filesize;
var receive_file_state = 'receive_meta';
var cur_received_filesize=0;
var receive_filestream = null;


pc.oniceconnectionstatechange = e => {
  log(pc.iceConnectionState);
};


dc.onopen = () => {
  chat.select();
  log('Data channel established');
};


dc.onmessage = e => {
  if (receive_file_state == 'receive_meta') {
    var json_obj = null;
    try {
      json_obj = JSON.parse(e.data);
    }
    catch (e) {
    }

    if (json_obj && json_obj.from_me_to_you_filename) {
      receive_filename = json_obj.from_me_to_you_filename;
      receive_filesize = json_obj.from_me_to_you_filesize;
      cur_received_filesize = 0;
      receive_file_state = 'receive_chunks';
      receive_filestream = streamSaver.createWriteStream(receive_filename, {
        size: receive_filesize
      });
      window.writer = receive_filestream.getWriter();
      log(`> Going to receive: ${receive_filename} of ${receive_filesize} bytes)`);
    }
    else { // string
      log(`> ${e.data}`);
    }
  }
  else if (receive_file_state == 'receive_chunks') {
    if (e.data instanceof Blob) {
      cur_received_filesize += e.data.size;
      log(`> ${e.data} (${cur_received_filesize} bytes)`);

      window.writer.write(e.data);

      if (cur_received_filesize >= receive_filesize) {
        receive_file_state = 'receive_meta';
        cur_received_filesize = 0;
        receive_filestream = null;
        window.writer.close();
      }
    }
  }
};


chat.onkeypress = function(e) {
  if (e.keyCode != 13) {return;}
  dc.send(chat.value);
  log(chat.value);
  chat.value = "";
};


$.fn.orderChildren = function(order) {
  this.each(function() {
    var el = $(this);
	  for(var i = order.length - 1; i >= 0; i--) {
        el.prepend(el.children(order[i]));
      }
    });
  return this;
};


function reset() {
  window.location.reload(true);
};


function changeActionOrder(party_) {
  party = party_;

  if (party == $("#offer_party").val()) {
    $("#gen_sdp_div *").prop('disabled', false);
    $("#my_text_div *").prop('disabled', false);
    $("#their_text_div *").prop('disabled', true);
    $("#file_div *").prop('disabled', true);
    $("#chat_div *").prop('disabled', true);

    $("#connection_actions").orderChildren([
      "#gen_sdp_div",
      "#my_text_div",
      "#their_text_div"
    ]);
  }
  else if (party == $("#answer_party").val()) {
    $("#their_text_div *").prop('disabled', false);
    $("#gen_sdp_div *").prop('disabled', true);
    $("#my_text_div *").prop('disabled', true);
    $("#file_div *").prop('disabled', true);
    $("#chat_div *").prop('disabled', true);


    $("#connection_actions").orderChildren([
      "#their_text_div",
      "#gen_sdp_div",
      "#my_text_div"
    ]);
  }
};


async function createOfferOrAnswer() {
  if (party == $("#offer_party").val()) {
    createOffer();
  }
};


async function createOffer() {
  // 1. generate offer
  // 2. copy the offer text
  $("#gen_sdp_div *").prop('disabled', true);

  await pc.setLocalDescription(await pc.createOffer());
  pc.onicecandidate = ({candidate}) => {
    if (candidate) {return;}
    $("#my_text").val(pc.localDescription.sdp);
    $("#my_text").focus();
    $("#my_text").select();
    document.execCommand("copy");

    $("#their_text_div *").prop('disabled', false);
  };
};


async function sendFile() {
  // 1. send meta data: name, size
  // 2. send chunks
  const chunk_size = 16384;
  dc.send(`{"from_me_to_you_filename":"${file_to_send.name}", "from_me_to_you_filesize":${file_to_send.size}}`);
  var file_reader = new FileReader();
  var offset = 0;
  file_reader.addEventListener('error', error => log('Error reading file:'+ error));
  file_reader.addEventListener('load', e => {
    dc.send(e.target.result);
    offset += e.target.result.byteLength;
    log('Sent ' + offset + ' bytes');
    if (offset < file_to_send.size) {
      readSlice(offset);
    }
  });
  const readSlice = o => {
    const slice = file_to_send.slice(offset, o + chunk_size);
    file_reader.readAsArrayBuffer(slice);
  };
  readSlice(0);
}


$("#their_text").keypress( async function(e) {
  if (e.keyCode != 13) {return;}
  if (party == $("#offer_party").val()) {
    if (pc.signalingState != "have-local-offer") {return;}

    $("#file_div *").prop('disabled', false);
    $("#chat_div *").prop('disabled', false);
    await pc.setRemoteDescription({type: "answer", sdp: $('#their_text').val()});
  }
  else if (party == $("#answer_party").val()) {
    if (pc.signalingState != "stable") {return;}
    $("#my_text_div *").prop('disabled', false);

    await pc.setRemoteDescription({type: "offer", sdp: $('#their_text').val()});
    await pc.setLocalDescription(await pc.createAnswer());

    pc.onicecandidate = ({candidate}) => {
      if (candidate) {return;}
      $("#my_text").val(pc.localDescription.sdp);
      $("#my_text").focus();
      $("#my_text").select();
      document.execCommand("copy");

      $("#file_div *").prop('disabled', false);
      $("#chat_div *").prop('disabled', false);
    };
  }
});


$("#file_input").change( async function(e) {
  file_to_send = $("#file_input").prop("files")[0];
});
