declare namespace IAM {
  type Middleware = (
    /**
     * The request message
     */
    req: IncomingMessage,
    /**
     * The request response object
     */
    res: OutgoingMessage,
    /**
     * The callback
     */
    next: { (err: Error): void },
  ) => Promise;

  interface Main {
    /**
     * Set the prefix of the request
     */
    prefix: string;
    /**
     * Set the current route as a global one (Usefull when we don not want to include the prefix)
     */
    is_global: boolean;
    /**
     * Set the parameters of the request
     */
    params: Param[];
    /**
     * Set the sub-routes of the request
     */
    routes: Route[];
  }

  interface Param {
    /**
     * Name of the parameter
     */
    name: string;
    /**
     * List of the middlewares to be executed
     */
    middleware: Middleware;
  }

  interface Route {
    /**
     * Path of the route
     */
    path: string;
    /**
     * Methods of the request
     */
    methods: {
      /**
       * Will be execute on receiving a request of type "GET"
       */
      get?: Method;
      /**
       * Will be execute on receiving a request of type "POST"
       */
      post?: Method;
      /**
       * Will be execute on receiving a request of type "PUT"
       */
      put?: Method;
      /**
       * Will be execute on receiving a request of type "DELETE"
       */
      delete?: Method;
    };
  }

  interface Method {
    /**
     * List of the middlewares
     */
    middlewares: Middleware[];
    /**
     * Sets the IAM key
     */
    iam: string;
    /**
     * Use this attribute to set the title of the IAM
     */
    title: string;
    /**
     * Use this attribute to set the description of the IAM
     */
    description: string;
  }

  export default Main;
}
