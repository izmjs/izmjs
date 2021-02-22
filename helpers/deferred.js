exports.Deferred = class Deferred {
  constructor() {
    // update 062115 for typeof
    if (typeof Promise !== 'undefined' && Promise.defer) {
      // need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
      return Promise.defer();
    }

    /* A method to resolve the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} value : This value is used to resolve the promise
     * If the value is a Promise then the associated promise assumes the state
     * of Promise passed as value.
     */
    this.resolve = null;

    /* A method to reject the assocaited Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} reason: The reason for the rejection of the Promise.
     * Generally its an Error object. If however a Promise is passed, then the Promise
     * itself will be the reason for rejection no matter the state of the Promise.
     */
    this.reject = null;

    /* A newly created Promise object.
     * Initially in pending state.
     */
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    Object.freeze(this);
  }
};
