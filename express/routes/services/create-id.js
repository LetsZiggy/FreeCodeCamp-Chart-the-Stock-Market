let characters = [
  '0','1','2','3','4','5','6','7','8','9',
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '-','_'
];

function createID(polls) {
  let run = true;
  let id = null;
  let takenIDs = Object.entries(polls).map((v, i, a) => v[0]);
  // let takenIDs = polls.map((v, i, a) => v[0]);

  while(run) {
    let tempID = [];

    for(let i = 0; i < 8; i++) {
      let index = Math.floor(Math.random() * 62);
      tempID.push(characters[index]);
    }

    tempID = tempID.join('');
    if(takenIDs.indexOf(tempID) === -1) {
      run = false;
      id = tempID;
    }
  }

  return(id);
}

module.exports = createID;