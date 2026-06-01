"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            if (validatedData.body !== undefined)
                req.body = validatedData.body;
            if (validatedData.query !== undefined) {
                Object.assign(req.query, validatedData.query);
            }
            if (validatedData.params !== undefined) {
                Object.assign(req.params, validatedData.params);
            }
            next();
        }
        catch (error) {
            if (error && error.errors) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
