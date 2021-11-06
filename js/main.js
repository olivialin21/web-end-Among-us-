let serverURL = 'https://script.google.com/macros/s/AKfycbzmcD8tnmIkPFHwmxTua05PMemlY1wWdiYHZ5PrTrZuj0Bxaj4QoHMor1_eNiXpQQTT/exec'
let records = [];
let crewNum = 6;
let crewState = [
  {
    name:"NTUE",
    color:"red",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Crewmate"
  },
  {
    name:"WEB",
    color:"blue",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Crewmate"
  },
  {
    name:"DTD",
    color:"green",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Imposter"
  },
  {
    name:"END",
    color:"white",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Crewmate"
  },
  {
    name:"BY",
    color:"pink",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Crewmate"
  },
  {
    name:"OLIVIA",
    color:"orange",
    voted:false,
    votes:0,
    ejected:false,
    identity:"Crewmate"
  }
];

$(document).ready(function(){
  $('.ejectedAnimation').hide();
  $('#README').modal('show');

  let $templateCrew = $('#template-crew');
  $.ajax({
    async: false,
    type: 'GET',
    url: 'json/crews.json',
    success: function(data) {
      for(let i=0;i<data.length;i++){
        let $node = $templateCrew.html();
        $node = $node.replace('IMG_HERE',data[i].imgurlHead);
        $node = $node.replace('EJECTED_HERE',data[i].color+"-ejected");
        $node = $node.replace('NAME_HERE',data[i].name);
        $node = $node.replaceAll('REASON_HERE',data[i].color+"-reason");
        $node = $node.replaceAll('SUS_HERE',data[i].color+"-sus");
        $node = $node.replace('VOTE_HERE',data[i].color+"-vote");
        $node = $node.replace('BTN_HERE',data[i].color+"-btn");
        $('#vote-crews').append($node);
      }
    }
  });

  $('#red-btn').click(function(){
    selectLock("red",0);
  });
  $('#blue-btn').click(function(){
    selectLock("blue",1);
  });
  $('#green-btn').click(function(){
    selectLock("green",2);
  });
  $('#white-btn').click(function(){
    selectLock("white",3);
  });
  $('#pink-btn').click(function(){
    selectLock("pink",4);
  });
  $('#orange-btn').click(function(){
    selectLock("orange",5);
  });

  for(let i=0;i<crewState.length;i++){
    $("#"+crewState[i].color+"-sus").change(function(e){
      removeTip($(this));
    });
    $("#"+crewState[i].color+"-reason").change(function(e){
      removeTip($(this));
    });
  }

  for(let i=0;i<crewState.length;i++){
    $('#'+crewState[i].color+'-votes').html(crewState[i].votes);
  }

  $('#victory-btn').click(function(){
    if ($("#victory-player-name").val()=='') {
      setTip($("#victory-player-name"));
    } else {
      sendToServer("victory");
    }
  });
  $('#defeat-btn').click(function(){
    if ($("#defeat-player-name").val()=='') {
      setTip($("#defeat-player-name"));
    } else {
      sendToServer("defeat");
    }
  });
  $("#victory-player-name").focusout(function(e){
    if($(this).val() != ''){
      removeTip($(this));
    }
  });
  $("#defeat-player-name").focusout(function(e){
    if($(this).val() != ''){
      removeTip($(this));
    }
  });
  $("#victory-player-name").keyup(function(e){
    if($(this).val() != ''){
      removeTip($(this));
    }
  });
  $("#defeat-player-name").keyup(function(e){
    if($(this).val() != ''){
      removeTip($(this));
    }
  });
})

const selectLock = (color,index) => {
  if ($("#"+color+"-sus").val()!=null && $("#"+color+"-reason").val()!=null){
    crewState[index].voted = true;
    $("#"+color+"-sus").attr('disabled','disabled')
    $("#"+color+"-reason").attr('disabled','disabled')
    $("#"+color+"-btn").attr('aria-disabled','true')
    $("#"+color+"-btn").addClass('disabled')
    let susCrew = crewState.find(x => x.color == $("#"+color+"-sus").val())
    susCrew.votes += 1;
  }
  if ($("#"+color+"-sus").val()==null) {
    setTip($("#"+color+"-sus"));
  }
  if ($("#"+color+"-reason").val()==null) {
    setTip($("#"+color+"-reason"))
  }
  checkLock();  
}

const setTip = (dom) => {
  let template = $('#tipTemplate01');
  let node = template.html();
  if (dom.closest('.main-group').find('.tip').length==0){
    dom.closest('.main-group').append(node);
    dom.closest('.main-group').addClass('bdr');
  };
}

const removeTip = (dom) => {
  dom.closest('.main-group').find('.tip').remove();
  dom.closest('.main-group').removeClass('bdr');
}

const checkLock = () => {
  let allVote = true;
  for(let i=0;i<crewState.length;i++){
    if(!crewState[i].voted){
      if(!crewState[i].ejected){
        allVote = false;
      }
    }
  }
  if(allVote){
    for(let i=0;i<crewState.length;i++){
      if(!crewState[i].ejected){
        $('#'+crewState[i].color+'-vote').html("Votes: "+crewState[i].votes);
      } else if (crewState[i].ejected){
        $('#'+crewState[i].color+'-vote').html('');
      }
    }
    $('.voteNum').fadeIn();
    let ejectedNum = maxVotes();
    let equal = checkEqual(ejectedNum);
    if (equal) {
      $('#ejected-text').html("No one was ejected.");
      setTimeout(function(){
        playAnimation(-1);
        $('.ejectedAnimation').delay(5000).fadeOut(500);
        $('#ejected-text').delay(5000).fadeOut(500);
      },2000);
      setTimeout(function(){
        resetScreen(-1);
      },3000)
      saveRecord(-1);
    } else {
      crewNum -= 1;
      $('#ejected-text').html(crewState[ejectedNum].name+" was ejected.");
      setTimeout(function(){
        playAnimation(ejectedNum);
        $('.ejectedAnimation').delay(5000).fadeOut(500);
        $('#ejected-text').delay(5000).fadeOut(500);
      },2000);
      setTimeout(function(){
        resetScreen(ejectedNum);
      },3000)
      setTimeout(function(){
        checkWin(ejectedNum);
      },7500)
      saveRecord(ejectedNum);
    }
  }
}

const maxVotes = () => {
  let ejectedNum = -1;
  let maxNum = 0;
  for(let i=0;i<crewState.length;i++){
    if (crewState[i].votes>maxNum){
      maxNum = crewState[i].votes;
      ejectedNum = i;
    }
  }
  return ejectedNum;
}

const checkEqual = (num) => {
  for(let i=0;i<crewState.length;i++){
    if(crewState[i].votes == crewState[num].votes & i != num){
      return true;
    }
  }
  return false;
}

const playAnimation = (num) => {
  $('.ejectedAnimation').fadeIn(500);
  $('#ejected-text').delay(2000).fadeIn(500);
  gsap.to('#ejected-bg',{duration:0,x:0});
  gsap.to('#ejected-bg',{duration:8,x:-400});
  let screenW = $( window ).width();
  if (num==-1){
    // gsap.to()
  } else {
    gsap.to('#ejected-'+crewState[num].color,{duration:8,rotation:720,x:screenW+380})
  }
}

const saveRecord = (num) => {
  let record = {
    crew: "",
    reason: [],
    identity: ""
  };
  if (num==-1){
    record.crew = "no";
  } else {
    record.crew = crewState[num].color;
    record.identity = crewState[num].identity;
  }
  for(let i=0;i<crewState.length;i++){
    if ($('#'+crewState[i].color+'-sus').val()==record.crew) {
      record.reason.push($('#'+crewState[i].color+'-reason').val());
    }
  }
  records.push(record);
  console.log(records);
}

const resetScreen = (num) => {
  if (num != -1){
    crewState[num].ejected=true;
    $('#'+crewState[num].color+'-ejected').addClass('show');
    $('.option-'+crewState[num].color).remove();
  }
  for(let i=0;i<crewState.length;i++){
    crewState[i].voted = false;
    crewState[i].votes = 0;
    $("#"+crewState[i].color+"-sus").removeAttr('disabled')
    $("#"+crewState[i].color+"-reason").removeAttr('disabled')
    $("#"+crewState[i].color+"-sus").val('');
    $("#"+crewState[i].color+"-reason").val(''); 
    $("#"+crewState[i].color+"-btn").removeAttr('aria-disabled')
    $("#"+crewState[i].color+"-btn").removeClass('disabled')
    $('.voteNum').fadeOut();
  }
}

const checkWin = (num) => {
  if (crewState[num].identity=="Imposter"){
    Win("Crewmate");
  } else if (crewNum <=2) {
    Win("Imposter");
  }
}

const Win = (identity) => {
  switch (identity) {
    case "Crewmate":
      $('.victory').fadeIn();
      break;
    case "Imposter":
      $('.defeat').fadeIn();
      break;
  }
}

function sendToServer(win){
  let parameter = {};
  parameter.playerName = $('#'+win+'-player-name').val();
  parameter.records = JSON.stringify(records);
  parameter.win = win;
  parameter.method="write1";

  console.log(parameter);
  $.post(serverURL, parameter, function(data){
    console.log(data);
    if(data.result == 'sus'){
      alert('儲存成功')
    }else{
      alert('送出失敗，請檢查後再試看看');
    }
  }).fail(function(data){
    alert('送出失敗');
    console.log(data);
  });
}