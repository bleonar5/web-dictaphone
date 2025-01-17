
const confirm = document.querySelector('.confirm');

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

$( document ).ready(function() {
  lang = getUrlParameter('lang');
  if(!lang)
    lang='eng';
  confirm.disabled=true;
  stim_data = stim_data[lang];
  if (localStorage.getItem('stim_idx'))
    stim_idx = parseInt(localStorage.getItem('stim_idx'));
  else
    stim_idx = 0;
  for(var i = 0; i < stim_data.length; i++){
    $('#stim_idx').append('<option val="'+i.toString+'">'+i.toString()+'</option>');
  }
  $('#stim_idx').val(stim_idx);
  $('#stim_len').text(stim_data.length);

  trial = stim_data[stim_idx];
  $('#sentence').text(trial['sentence']);

  $('#stim_idx').on('change',function(e){
    console.log('change');
    stim_idx = parseInt($(this).val());
      localStorage.setItem('stim_idx',stim_idx);
      trial = stim_data[stim_idx];
      $('#sentence').text(trial['sentence']);
      $('#clips').empty();
      confirm.disabled=true;
  });


  console.log(stim_data);
});
// set up basic variables for app

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

// disable stop button while not recording

stop.disabled = true;
confirm.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      //mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
      confirm.disabled = false;
    }



    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      //const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
      const clipName = null;
      const clipContainer = document.createElement('article');
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');


      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';


      clipContainer.appendChild(audio);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type' : 'audio/mp3; codecs=opus' });

      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");
      
      confirm.onclick = function() {
        console.log('confirm');
        saveAs(blob,stim_data[stim_idx]['filename']);
        stim_idx += 1;
        localStorage.setItem('stim_idx',stim_idx)
        $('#stim_idx').val(stim_idx);
        $('#stim_len').text(stim_data.length);

        trial = stim_data[stim_idx];
        $('#sentence').text(trial['sentence']);
        $('#audiolink').attr('download',trial['filename'])
        $('#clips').empty();
        confirm.disabled = true;

    }

      deleteButton.onclick = function(e) {
        let evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }

    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();
