"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = (res) => (a) => res.status(200).json(a);
exports.sendError = (res) => (err) => res.status(err.code).json({ error: err.message });
