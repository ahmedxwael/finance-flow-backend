import {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { API_PREFIX } from "../config/env";
import { logRouteCompletion } from "../shared/utils";

export type RouteMethod = "get" | "post" | "put" | "patch" | "delete";

export type Route = {
  path: string;
  method: RouteMethod;
  handler: RequestHandler;
};

/**
 * RouteBuilder class for fluent route chaining
 * Allows: router.route("/users").get(() => {}).post(() => {})
 */
class RouteBuilder {
  private basePath: string;
  private parentRouter: Router;

  constructor(basePath: string, parentRouter: Router) {
    this.basePath = basePath;
    this.parentRouter = parentRouter;
  }

  private addRoute(method: RouteMethod, path: string, handler: RequestHandler) {
    // If path is provided, append it to basePath, otherwise use basePath
    const fullPath = path ? `${this.basePath}${path}` : this.basePath;
    this.parentRouter.addRoute(method, fullPath, handler);
    return this; // Return this for chaining
  }

  /**
   * Method Overloading Pattern:
   * These methods support two ways of calling:
   * 1. With just a handler: .get(handler) - uses the base path from route()
   * 2. With path + handler: .get("/:id", handler) - appends path to base path
   *
   * The first two lines are TypeScript function overload signatures (type definitions)
   * The third line is the actual implementation that handles both cases
   */

  // GET method overloads - allows .get(handler) or .get(path, handler)
  public get(handler: RequestHandler): this;
  public get(path: string, handler: RequestHandler): this;
  public get(
    pathOrHandler: string | RequestHandler,
    handler?: RequestHandler
  ): this {
    // If first param is a function, it's the handler (no path provided)
    if (typeof pathOrHandler === "function") {
      return this.addRoute("get", "", pathOrHandler);
    }
    // Otherwise, first param is the path, second is the handler
    return this.addRoute("get", pathOrHandler, handler!);
  }

  // POST method overloads - allows .post(handler) or .post(path, handler)
  public post(handler: RequestHandler): this;
  public post(path: string, handler: RequestHandler): this;
  public post(
    pathOrHandler: string | RequestHandler,
    handler?: RequestHandler
  ): this {
    if (typeof pathOrHandler === "function") {
      return this.addRoute("post", "", pathOrHandler);
    }
    return this.addRoute("post", pathOrHandler, handler!);
  }

  // PUT method overloads - allows .put(handler) or .put(path, handler)
  public put(handler: RequestHandler): this;
  public put(path: string, handler: RequestHandler): this;
  public put(
    pathOrHandler: string | RequestHandler,
    handler?: RequestHandler
  ): this {
    if (typeof pathOrHandler === "function") {
      return this.addRoute("put", "", pathOrHandler);
    }
    return this.addRoute("put", pathOrHandler, handler!);
  }

  // PATCH method overloads - allows .patch(handler) or .patch(path, handler)
  public patch(handler: RequestHandler): this;
  public patch(path: string, handler: RequestHandler): this;
  public patch(
    pathOrHandler: string | RequestHandler,
    handler?: RequestHandler
  ): this {
    if (typeof pathOrHandler === "function") {
      return this.addRoute("patch", "", pathOrHandler);
    }
    return this.addRoute("patch", pathOrHandler, handler!);
  }

  // DELETE method overloads - allows .delete(handler) or .delete(path, handler)
  public delete(handler: RequestHandler): this;
  public delete(path: string, handler: RequestHandler): this;
  public delete(
    pathOrHandler: string | RequestHandler,
    handler?: RequestHandler
  ): this {
    if (typeof pathOrHandler === "function") {
      return this.addRoute("delete", "", pathOrHandler);
    }
    return this.addRoute("delete", pathOrHandler, handler!);
  }
}

export class Router {
  private static instance: Router;
  private routes: Route[] = [];
  private prefix: string = `/${API_PREFIX || ""}`;

  private constructor(prefix: string = "") {
    this.prefix += prefix;
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  /**
   * @description Internal method to add a route
   * @param method - The HTTP method
   * @param path - The path of the route
   * @param handler - The handler function
   */
  public addRoute(method: RouteMethod, path: string, handler: RequestHandler) {
    this.routes.push({
      path,
      method,
      handler,
    });
  }

  /**
   * @description Add a GET route
   * @param path - The path of the route
   * @param handler - The handler function
   * @returns The router instance
   */
  public get(path: string, handler: RequestHandler) {
    this.addRoute("get", path, handler);
    return this;
  }

  /**
   * @description Add a POST route
   * @param path - The path of the route
   * @param handler - The handler function
   * @returns The router instance
   */
  public post(path: string, handler: RequestHandler) {
    this.addRoute("post", path, handler);
    return this;
  }

  /**
   * @description Add a PUT route
   * @param path - The path of the route
   * @param handler - The handler function
   * @returns The router instance
   */
  public put(path: string, handler: RequestHandler) {
    this.addRoute("put", path, handler);
    return this;
  }

  /**
   * @description Add a PATCH route
   * @param path - The path of the route
   * @param handler - The handler function
   * @returns The router instance
   */
  public patch(path: string, handler: RequestHandler) {
    this.addRoute("patch", path, handler);
    return this;
  }

  /**
   * @description Add a DELETE route
   * @param path - The path of the route
   * @param handler - The handler function
   * @returns The router instance
   */
  public delete(path: string, handler: RequestHandler) {
    this.addRoute("delete", path, handler);
    return this;
  }

  /**
   * @description Create a route builder for fluent chaining
   * @param path - The base path for the route
   * @returns A RouteBuilder instance for method chaining
   * @example
   * router.route("/users").get(() => {}).post(() => {})
   * router.route("/users").get("/:id", () => {}).put("/:id", () => {})
   */
  public route(path: string): RouteBuilder {
    return new RouteBuilder(path, this);
  }

  /**
   * @description Scan the routes and add them to the express app
   * @param app - The express app
   * @param options - The options for the route
   * @returns The router instance
   */
  public scan(app: Express) {
    this.routes.forEach((route) => {
      const handler = (
        req: Request,
        res: Response,
        next: NextFunction
      ): void => {
        const startTime = Date.now();

        // Track when response finishes to get actual status code
        res.once("finish", () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;

          logRouteCompletion(
            route.method,
            `${this.prefix}${route.path}`,
            statusCode,
            duration
          );
        });

        // Call the original handler
        route.handler(req, res, next);
      };

      app[route.method](`${this.prefix}${route.path}`, handler);
    });
  }

  /**
   * @description Get the routes
   * @returns The routes
   */
  public getRoutes() {
    return this.routes;
  }
}

/**
 * @description The router instance
 */
export const router = Router.getInstance();
