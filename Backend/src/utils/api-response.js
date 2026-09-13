class Apiresponse {
  constructor(status, message="success", data) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.succeess = this.statusCode<400? true: false;
  }

}

export {Apiresponse};