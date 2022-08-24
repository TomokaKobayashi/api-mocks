import { ChangeDetector } from "./types";
import { ErrorLogger } from "./logger";
export declare const controlRouter: (apiRoot: string, changeDetector: ChangeDetector, logger: ErrorLogger | undefined) => import("express-serve-static-core").Router;
