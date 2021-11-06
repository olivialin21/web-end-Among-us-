const serverURL = 'https://script.google.com/macros/s/AKfycbzmcD8tnmIkPFHwmxTua05PMemlY1wWdiYHZ5PrTrZuj0Bxaj4QoHMor1_eNiXpQQTT/exec'
let crewImg = [
  {
    imgurlHead:"images/red_head.png",
    color:"red"
  },
  {
    imgurlHead:"images/blue_head.png",
    color:"blue"
  },
  {
    imgurlHead:"images/green_head.png",
    color:"green"
  },
  {
    imgurlHead:"images/white_head.png",
    color:"white"
  },
  {
    imgurlHead:"images/pink_head.png",
    color:"pink"
  },
  {
    imgurlHead:"images/orange_head.png",
    color:"orange"
  }
]

$(document).ready(function(){
  readFromServer();
});

function readFromServer(){
  let parameter = {};
  parameter.method = 'read1';
  $.post(serverURL, parameter, function(data){
    setTable(data);
  }).fail(function(data){
    alert('error');
  })
}

async function setTable (sData){
  let node = $('#tr01').html();
  for(let i=0;i<sData.length;i++){
    let day = new Date(sData[i][2]);
    let date = (day.getMonth()+1)+"-"+day.getDate()+" "+day.getHours()+":"+day.getMinutes();
    let record = JSON.parse(sData[i][4])
    let content = node.replace('LIST_HERE', i+1);
    content = content.replace('NAME_HERE', sData[i][1]);
    content = content.replace('DATE_HERE', date);
    content = content.replace('RESULT_HERE', sData[i][3]);
    content = content.replace('ID_HERE', sData[i][0]);
    $('tbody').append(content);
    for(let j=0;j<record.length;j++){
      if(record[j].crew=="no"){
        $('#'+sData[i][0]).append(
          '<div class="record-block row"><p class="col-2 pr-0">第'+(j+1)+'輪</p><div class="crew-head col-1 pr-0"></div><span class="record-identity col-2"></span><span class="col-7">無人出局</span></div>'
        );
      } else {
        let obj = crewImg.find(x => x.color == record[j].crew)
        $('#'+sData[i][0]).append(
          '<div class="record-block row"><p class="col-2 pr-0">第'+(j+1)+'輪</p><div class="col-1 p-0 d-flex justify-content-center"><img class="crew-head" src="'+obj.imgurlHead+'" alt=""></div><span class="record-identity col-2">'+record[j].identity+'</span><span class="col-7">原因：'+record[j].reason+'</span></div>'
        );
      }
    }
  }
}