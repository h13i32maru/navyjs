function sleep(msec) {
  return new Promise((resolve, reject)=>{
    if (msec < 0) {
      return reject(new Error(`msec must be greater than 0. msec = ${msec}`));
    }

    setTimeout(resolve, msec);
  });
}

function request(url) {
  return new Promise((resolve, reject)=> {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
      xhr.onload = null;
      resolve(xhr.responseText);
    };
    xhr.onerror = () => {
      xhr.onerror = null;
      reject(new Error(xhr.statusText));
    };
    xhr.send();
  });
}

async(function*(){
  console.log('sleep...');
  yield sleep(1000);
  console.log('wake!');

  console.log('request ./fixture.json');
  var res = yield request('./fixture.json');
  console.log('response', JSON.parse(res));
});
