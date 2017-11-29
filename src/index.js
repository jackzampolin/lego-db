var blockstack = require('blockstack');
const uuidv1 = require('uuid/v1');

var successResponse = {
  statusCode: 200,
  statusText: 'SUCCESS',
  description: null
};

var failureResponse = {
  statusCode: 400,
  statusText: 'FAILURE',
  description: null
};

exports.createStack = createStack;
exports.dropStack = dropStack;
exports.createDocument = createDocument;
exports.findAll = findAll;


function createStack(stackName){
    var newStackDetails = {
      stackName: stackName,
      isActive: true,
      createdAt: Date.now()
    };

    var existingStacks = [{}];
    var stackExists = false;
    return new Promise((resolve, reject) => {
      blockstack.getFile('stackmaster.json', true).then(dat => {
          existingStacks = JSON.parse(dat);
          existingStacks.map((existingStack) => {
              if (existingStack.stackName == stackName && existingStack.isActive == true) {
                  console.log('Stack exists.');
                  failureResponse.description = 'This stack already exists.';
                  stackExists = true;
                  reject(failureResponse);
              }
          });

          if(!stackExists){
            existingStacks.push(newStackDetails);

            blockstack.putFile(stackName, '', true).then(dat => {
                blockstack.putFile('stackmaster.json', JSON.stringify(existingStacks), true).then(dat => {
                    successResponse.description = 'Stack created successfully.';
                    resolve(successResponse);
                }).catch(function (e) {
                    console.log(e);
                    failureResponse.description = 'Unable to create stack at the moment.';
                    reject(failureResponse);
                })
            }).catch(function(e) {
                console.log(e);
                failureResponse.description = 'Unable to create stack at the moment.';
                reject(failureResponse);
            });

          }
        }).catch(function (e) {
          console.log(e);
          blockstack.putFile(stackName, "", true).then(dat => {
              var firstStackDetails = [];
              firstStackDetails.push(newStackDetails);
              blockstack.putFile('stackmaster.json', JSON.stringify(firstStackDetails), true).then(dat => {
                  console.log(dat);
                  successResponse.description = 'Stack created successfully.';
                  resolve(successResponse);
              }).catch(function (e) {
                  console.log(e);
                  failureResponse.description = 'Unable to create stack at the moment.';
                  reject(failureResponse);
              })
          }).catch(function(e) {
              console.log(e);
              failureResponse.description = 'Unable to create stack at the moment.';
              reject(failureResponse);
          });
        });
    });
}


function dropStack(stackName){
    var stackExists = false;
    return new Promise((resolve, reject) => {
      blockstack.getFile('stackmaster.json', true).then(dat => {
          console.log("done " + JSON.parse(dat));

          existingStacks = JSON.parse(dat);
          existingStacks.map((existingStack) => {
              if (existingStack.stackName === stackName) {
                  console.log('Stack exists.');
                  stackExists = true;
                  existingStack.isActive = false;
                  blockstack.putFile('stackmaster.json', JSON.stringify(existingStacks), true).then(dat => {
                      console.log(dat);
                      successResponse.description = 'Stack dropped successfully.';
                      resolve(successResponse);
                  }).catch(function (e) {
                      console.log(e);
                      failureResponse.description = 'Unable to drop stack at the moment.';
                      reject(failureResponse);
                  })
              }
          });
          if(!stackExists){
            failureResponse.description = 'Stack does not exist.';
            reject(failureResponse);
          }
      }).catch(function (e) {
          failureResponse.description = 'No stacks have been created.';
          reject(failureResponse);
      });
    });
}


function createDocument(stackName, documentJson){
    documentJson.init.objectId = uuidv1();
    documentJson.init.createdAt = Date.now();
    documentJson.init.isActive = true;

    var stackExists = false;
    return new Promise((resolve, reject) => {
      blockstack.getFile('stackmaster.json', true).then(dat => {
          console.log("done " + JSON.parse(dat));
          existingStacks = JSON.parse(dat);

          existingStacks.map((existingStack) => {
              if (existingStack.stackName == stackName) {
                  stackExists = true;
                  if(existingStack.isActive == false){
                    failureResponse.description = 'Stack has been deleted.';
                    reject(failureResponse);
                  }
                  else{
                    blockstack.getFile(stackName, true).then(dat => {
                      var documents = JSON.parse(dat);
                      documents.push(documentJson);
                      blockstack.putFile(stackName, JSON.stringify(documents), true).then(dat =>
                          successResponse.description = 'Document created successfully.';
                          resolve(successResponse);
                      }).catch(function (e) {
                          console.log(e);
                          failureResponse.description = 'Unable to create document at the moment.';
                          reject(failureResponse);
                      });
                    }).catch(function (e) {
                        console.log(e);
                        failureResponse.description = 'Unable to retrive stack at the moment.';
                        reject(failureResponse);
                    });
                  }
              }
          });
          if(!stackExists){
              failureResponse.description = 'Stack does not exist.';
              reject(failureResponse);
          }
      }).catch(function (e) {
          failureResponse.description = 'Unable to fetch stacks at the moment.';
          reject(failureResponse);
      });
    });
}

function findAll(stackName){
  var stackExists = false;
  return new Promise((resolve, reject) => {
    blockstack.getFile('stackmaster.json', true).then(dat => {
        console.log("done " + JSON.parse(dat));
        existingStacks = JSON.parse(dat);
        existingStacks.map((existingStack) => {
            if (existingStack.stackName == stackName) {
                stackExists = true;
                if(existingStack.isActive == false){
                  failureResponse.description = 'Stack has been deleted.';
                  reject(failureResponse);
                }
                blockstack.getFile(stackName, true).then(dat => {
                    console.log(dat);
                    //TODO filter active documents, remove init object from each.
                    successResponse.description = 'Documents fetched successfully.';
                    successResponse.documents = JSON.parse(dat);
                    resolve(successResponse);
                }).catch(function (e) {
                    console.log(e);
                    failureResponse.description = 'Unable to fetch documents at the moment.';
                    reject(failureResponse);
                });
            }
        });
        if(!stackExists){
            failureResponse.description = 'Stack does not exist.';
            reject(failureResponse);
        }
    }).catch(function (e) {
        failureResponse.description = 'No stacks have been created.';
        reject(failureResponse);
    });
  });
}
