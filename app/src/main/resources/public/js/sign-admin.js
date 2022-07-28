/*
 * #%L
 * Telsigne
 * %%
 * Copyright (C) 2016 Orange
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */
console.log("Cool, recorder.js is loaded :)");

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

var videoContainer = document.getElementById('container_video');
var labelRecord = document.getElementById('label_record');
var labelAfterRecord = document.getElementById('label_after_record');
var videoElement = document.getElementById('video');

var startRecording = document.getElementById('start-recording');
var retryRecording = document.getElementById('retry-recording');
var stopRecording = document.getElementById('stop-recording');
var cancelRecording = document.getElementById('cancel-recording');
document.getElementById('container-button').style.display = "none";

var videoFile = {};
var errorSpan = document.getElementById('errorSpan');
var counter = 3;
var t;

var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && ('netscape' in window) && / rv:/.test(navigator.userAgent);

function timedCount() {
  document.getElementById("counter").textContent = counter;
  counter = counter - 1;
  if (counter < 0) {
    document.getElementById("counter").style.visibility="hidden";
    document.getElementById('start-recording').style.display = "none";
    document.getElementById('stop-recording').style.display = "inline-block";
    counter = 3;
    window.audioVideoRecorder.startRecording();
    return;
  }
  t = setTimeout(function(){ timedCount() }, 1000);
}

function startRecord() {
  labelRecord.style.display = "none";
  labelAfterRecord.style.display = "none";
  startRecording.disabled = true;
  stopRecording.disabled = false;
  document.getElementById('start-recording').disabled = true;
  document.getElementById('stop-recording').disabled = false;

  document.getElementById("counter").style.visibility = "visible";
  timedCount();
}

function visualizeBeforeRecord() {
  videoContainer.style.display = "block";
  captureUserMedia00(function (stream) {
    window.audioVideoRecorder = window.RecordRTC(stream, {
      type: 'video',
      mimeType: 'video/webm;codecs=vp8',
      disableLogs: false
    });
    document.getElementById('video').style.visibility = "visible";
    document.getElementById("counter").style.visibility = "hidden";
  });
}


startRecording.onclick = function() {
  startRecord();
};


retryRecording.onclick = function () {
  document.getElementById('container-button').style.display = "none";
  /*document.getElementById('btnChecked').style.display = "none";*/
  document.getElementById('start-recording').style.display = "block";
  if ($('#uploadRecordedVideoFile').find('#errorSpan').length) {
    errorSpan.style.display="none";
  }
  document.getElementById("modal-footer_add_video_file_recording").style.display = "none";
  document.getElementById('start-recording').disabled = false;
  visualizeBeforeRecord();
};


stopRecording.onclick = function() {
  labelAfterRecord.style.display="block";
  labelAfterRecord.style.display="block";
  document.getElementById('container-button').style.display = "block";
  /*document.getElementById('btnChecked').style.display = "block";*/
  document.getElementById('stop-recording').style.display = "none";
  stopRecording.disabled = true;
  startRecording.disabled = false;
  document.getElementById('stop-recording').disabled = true;
  document.getElementById('retry-recording').disabled = false;
  document.getElementById('continue').disabled = false;
  document.getElementById("modal-footer_add_video_file_recording").style.display = "block";
  videoElement.src = videoElement.srcObject = null;

  window.audioVideoRecorder.stopRecording(function(url) {
    //downloadURL.innerHTML = '<a href="' + url + '" download="RecordRTC.webm" target="_blank">Save RecordRTC.webm to Disk!</a><hr>';
    videoElement.src = url;
    videoElement.muted = false;
    videoElement.play();


  if (isFirefox) {
      getSeekableBlob(audioVideoRecorder.getBlob(), function(seekableBlob) {
      var reader = new FileReader();
      reader.readAsDataURL(seekableBlob);
      reader.onload = function(event) {
          var video = {
                  blob: seekableBlob,
                  dataURL: event.target.result
                };
                prepareFileToPost(video);
          };
      });
  } else {
      audioVideoRecorder.getDataURL(function(audioVideoDataURL) {
            var video = {
              blob: audioVideoRecorder.getBlob(),
              dataURL: audioVideoDataURL
            };
            prepareFileToPost(video);
          });
  }
     });
};

cancelRecording.onclick = function() {
  location.reload();
};


function captureUserMedia00(callback) {
  captureUserMedia({
    audio: false,
    video: true
  }, function(stream) {
    console.log("function");
   /* videoElement.src = URL.createObjectURL(stream);*/
    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.controls = true;
    videoElement.play();

    callback(stream);
  }, function(error) {
    console.log("error "+error.message);
    alert(JSON.stringify(error));
  });
}

function prepareFileToPost(video) {
  // getting unique identifier for the file name
  fileName = generateRandomString();

  // this object is used to allow submitting multiple recorded blobs



  videoFile = {
    name: fileName + '.' + video.blob.type.split('/')[1].split(';')[0],
    type: video.blob.type,
    signNameRecording: null,
    contents: video.dataURL
  };
}


// generating random string
function generateRandomString() {
  if (window.crypto) {
    var a = window.crypto.getRandomValues(new Uint32Array(3)),
      token = '';
    for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
    return token;
  } else {
    return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
  }
}

var $formUploadRecordedVideoFile = $('#uploadRecordedVideoFile');
$formUploadRecordedVideoFile.on('submit', function(event) {
  document.getElementById('continue').disabled = true;
  document.getElementById('cancel-recording').disabled = true;
  document.getElementById('retry-recording').disabled = true;
  $(".spinner").removeClass("spinner_hidden").addClass("spinner_show");
  $("video").css("z-index","-1").css("opacity","0.40");
  $("video").removeAttr("controls");
  $(".spinner").css("z-index","1500").visibility="visible";
  $(".spinner").css("opacity", "1");
  /*$("#continue").css("color","black");*/
  videoFile.signNameRecording = $('#signNameRecording').val();
  event.preventDefault();
  $.ajax({
    url: $formUploadRecordedVideoFile.attr('action'),
    type: 'post',
    data: JSON.stringify(videoFile),
    contentType: "application/json",
    success: function(response) {
      errorSpan.style.display="none";
      $(".spinner").visibility="hidden";
      $("video").css("z-index","1500").css("opacity","1");
      location.reload();
    },
    error: function(response) {
      errorSpan.textContent = response.responseText;
      errorSpan.style.display="block";
      $(".spinner").css("z-index","-1").css("opacity","0.1");
      $(".spinner").visibility="hidden";
      $("video").css("z-index","1500").css("opacity","1");
      console.log("Erreur " + response.responseText);
      document.getElementById('cancel-recording').disabled = false;
    }
  })

});

$formUploadRecordedVideoFile.on('input', function(event) {
  document.getElementById('errorSpan').style.display="none";
});

var $add_video_file_recording = $('#add_video_file_recording');
$add_video_file_recording.on('hidden.bs.modal', function() {
  console.log("hidden add_video_file_recording modal");
  clearTimeout(t);
  audioVideoRecorder.clearRecordedData();
  videoContainer.style.display="none";
  labelRecord.style.display="block";
  labelAfterRecord.style.display="none";
  document.getElementById('start-recording').style.display = "inline-block";
  document.getElementById('container-button').style.display = "none";
  /*document.getElementById('btnChecked').style.display = "none";*/
  document.getElementById('stop-recording').style.display = "none";
  document.getElementById('stop-recording').disabled = true;
  document.getElementById('start-recording').disabled = false;
  document.getElementById('video').removeAttribute("src");
  document.getElementById('video').removeAttribute("controls");
  document.getElementById('video').pause();
  document.getElementById('video').style.visibility="hidden";
  $("video").css("z-index","").css("opacity","");
  $(".spinner").css("z-index","").css("opacity","");
  $(".spinner").removeClass("spinner_show").addClass("spinner_hidden");
  document.getElementById('continue').disabled = false;
  document.getElementById('cancel-recording').disabled = false;
  /*$("#continue").css("color","blue");*/
  if ($('#uploadRecordedVideoFile').find('#errorSpan').length) {
    errorSpan.style.display="none";
  }
  document.getElementById("modal-footer_add_video_file_recording").style.display = "none";
});

$add_video_file_recording.on('show.bs.modal', function() {
  visualizeBeforeRecord();
});

var errorSelectedSpan = document.getElementById('errorSelectedSpan');
/*var cancelSelectVideo = document.getElementById('cancel-select-video');*/


var $formUploadSelectedVideoFile = $('#uploadSelectedVideoFile');
$formUploadSelectedVideoFile.on('submit', function(event) {
  /*if (document.getElementById("InputFile").value) {*/
  $(".spinner").removeClass("spinner_hidden").addClass("spinner_show");
  $(".spinner").css("z-index", "1500").visibility = "visible";
  $(".spinner").css("opacity", "1");
  /*    $("#submitButtonFileDailymotion").css("color", "black");*/
  var $form = $(this);
  var formdata = new FormData($form[0]);
  var data = (formdata !== null) ? formdata : $form.serialize();
  document.getElementById('submitButtonFileDailymotion').disabled=true;
  event.preventDefault();
  $.ajax({
    url: $formUploadSelectedVideoFile.attr('action'),
    type: 'post',
    data: data,
    contentType: false,
    processData: false,
    success: function (response) {
      errorSelectedSpan.style.display = "none";
      $(".spinner").visibility = "hidden";
      location.reload();
    },
    error: function (response) {
      errorSelectedSpan.textContent = response.responseText;
      errorSelectedSpan.style.display = "inline-block";
      $(".spinner").css("z-index", "-1").css("opacity", "0.1");
      $(".spinner").visibility = "hidden";
      console.log("Erreur " + response.responseText);
    }
  })
  /*} else {
    event.preventDefault();
    errorSelectedSpan.textContent = "Vous devez séléctionner un fichier";
    errorSelectedSpan.style.display = "block";
  }*/

});

$formUploadSelectedVideoFile.on('input', function(event) {
  document.getElementById('errorSelectedSpan').style.display="none";
});

var $add_video_file_dailymotion = $('#add_video_file_dailymotion');
$add_video_file_dailymotion.on('hidden.bs.modal', function() {
  console.log("hidden add_video_file_dailymotion modal");

  if ($('#uploadSelectedVideoFile').find('#errorSelectedSpan').length) {
    errorSelectedSpan.style.display="none";
    /*$('#signNameSelected').val("");*/
  }
  document.getElementById('submitButtonFileDailymotion').disabled=true;

  document.getElementById("InputFile").value="";

  document.getElementById("subtitle_for_modal_video").style.display="";

});

function signVideoRecord(signId, videoId) {
  console.log("click on record sign video");
  $("#add_video_file_recording").modal('show');
  $('#uploadRecordedVideoFile').attr('action', '/ws/sec/uploadRecordedVideoFileFromSign/'+ signId + '/' + videoId);
  document.getElementById('label_record').style.visibility = "visible";
  document.getElementById('label_record').style.display = "block";
  document.getElementById('label_record_sign_definition').style.display = "none";
  labelRecord = document.getElementById('label_record');
  labelAfterRecord = document.getElementById('label_after_record');
}

function signVideoSelect(signId, videoId) {
  console.log("click on select sign video");
  $("#add_video_file_dailymotion").modal('show');
  $('#uploadSelectedVideoFile').attr('action', '/ws/sec/uploadSelectedVideoFileFromSign/'+ signId + '/' + videoId);
  document.getElementById('add_video_file_dailymotion_title_sign_video').style.visibility = "visible";
  document.getElementById('add_video_file_dailymotion_title_sign_video').style.display = "block";
  document.getElementById('add_video_file_dailymotion_title_sign_definition').style.display = "none";
}

function signDefinitionRecord(signId) {
  console.log("click on record sign definition");
  $("#add_video_file_recording").modal('show');
  $('#uploadRecordedVideoFile').attr('action', '/ws/sec/uploadRecordedVideoFileForSignDefinition/'+ signId);
  document.getElementById('label_record_sign_definition').style.visibility = "visible";
  document.getElementById('label_record_sign_definition').style.display = "block";
  document.getElementById('label_record').style.display = "none";
  labelRecord = document.getElementById('label_record_sign_definition');
  labelAfterRecord = document.getElementById('label_after_record_sign_definition');
}

function signDefinitionSelect(signId) {
  console.log("click on select sign definition");
  $("#add_video_file_dailymotion").modal('show');
  $('#uploadSelectedVideoFile').attr('action', '/ws/sec/uploadSelectedVideoFileForSignDefinition/'+ signId);
  document.getElementById('add_video_file_dailymotion_title_sign_definition').style.visibility = "visible";
  document.getElementById('add_video_file_dailymotion_title_sign_definition').style.display = "block";
  document.getElementById('add_video_file_dailymotion_title_sign_video').style.display = "none";
}

var errorDeletedSignDefinitionSpan = document.getElementById('errorDeletedSignDefinitionSpan');


var $formDeleteVideoForSignDefinition = $('#deleteVideoFileForSignDefinition');
$formDeleteVideoForSignDefinition.on('submit', function(event) {
  document.getElementById('submitButtonDelete').disabled = true;
  $(".spinner").removeClass("spinner_hidden").addClass("spinner-delete_show");
  $(".spinner").css("z-index","1500").visibility="visible";
  /*  $("#submitButtonDelete").css("color","black");*/
  var $form = $(this);
  var formdata = new FormData($form[0]);
  var data = (formdata !== null) ? formdata : $form.serialize();

  event.preventDefault();
  $.ajax({
    url: $formDeleteVideoForSignDefinition.attr('action'),
    type: 'post',
    data: data,
    contentType:false,
    processData: false,
    //dataType: 'json',
    success: function(response) {
      var url = response;
      errorDeletedSpan.style.visibility="hidden";
      $(".spinner").visibility="hidden";
      $("#delete_definition_sign").modal('hide');
      $("#validate_delete_definition_sign").modal('show');
      setTimeout(function(){
        $('#validate_delete_definition_sign').modal('hide');
        location.reload();
      }, 3000);

    },
    error: function(response) {
      errorDeletedSignDefinitionSpan.textContent = response.responseText;
      errorDeletedSignDefinitionSpan.style.visibility="visible";
      $(".spinner").css("z-index","-1").css("opacity","0.1");
      $(".spinner").visibility="hidden";
      console.log("Erreur " + response.responseText);
    }
  })

});

$formDeleteVideoForSignDefinition.on('input', function(event) {
  document.getElementById('errorDeletedSignDefinitionSpan').style.visibility="hidden";
});

var $delete_definition_sign = $('#delete_definition_sign');
$delete_definition_sign.on('hidden.bs.modal', function() {
  console.log("hidden delete_definition_sign modal");
  document.getElementById('submitButtonDeleteSignDefinition').disabled = false;
  if ($('#delete_definition_sign').find('#errorDeletedSignDefinitionSpan').length) {
    errorDeletedSignDefinitionSpan.style.visibility="hidden";
  }
});

function commentDelete(commentId, commentMessage) {
  console.log("commentDelete ", commentId, commentMessage);
  var confirmCommentDelete = document.getElementById('confirm_comment_delete');
  confirmCommentDelete.textContent = commentMessage;
  $("#modal_delete_comment").modal('show');
  $('#deleteComment').attr('action', '/ws/sec/comments/'+ commentId);

  /*document.getElementById('label_record').style.visibility = "visible";
  document.getElementById('label_record').style.display = "block";
  document.getElementById('label_record_sign_definition').style.display = "none";
  labelRecord = document.getElementById('label_record');
  labelAfterRecord = document.getElementById('label_after_record');*/
}

var errorDeletedCommentSpan = document.getElementById('errorDeletedCommentSpan');

var $formDeleteComment = $('#deleteComment');
$formDeleteComment.on('submit', function(event) {
  document.getElementById('submitButtonDeleteComment').disabled = true;
  $(".spinner").removeClass("spinner_hidden").addClass("spinner-delete_show");
  $(".spinner").css("z-index","1500").visibility="visible";
  event.preventDefault();
  $.ajax({
    url: $formDeleteComment.attr('action'),
    type: 'delete',
    success: function(response) {
      errorDeletedCommentSpan.style.visibility="hidden";
      $(".spinner").visibility="hidden";
      $("#modal_delete_comment").modal('hide');
      $("#validate_delete_comment").modal('show');
      setTimeout(function(){
        $('#validate_delete_comment').modal('hide');
        location.reload();
      }, 3000);

    },
    error: function(response) {
      errorDeletedCommentSpan.textContent = response.responseText;
      errorDeletedCommentSpan.style.visibility="visible";
      $(".spinner").css("z-index","-1").css("opacity","0.1");
      $(".spinner").visibility="hidden";
      console.log("Erreur " + response.responseText);
    }
  })

});

$formDeleteComment.on('input', function(event) {
  document.getElementById('errorDeletedCommentSpan').style.visibility="hidden";
});

var $modal_delete_comment = $('#modal_delete_comment');
$modal_delete_comment.on('hidden.bs.modal', function() {
  console.log("hidden modal_delete_comment");
  document.getElementById('submitButtonDeleteComment').disabled = false;
  if ($('#modal_delete_comment').find('#errorDeletedCommentSpan').length) {
    errorDeletedCommentSpan.style.visibility="hidden";
  }
});

$(document).ready(function(){
  $('input[type="file"]').change(function(e){
    $("#add_video_file_dailymotion").modal('show');
    document.getElementById('submitButtonFileDailymotion').disabled=false;
  });
});