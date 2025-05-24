const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        const errorDetails = error.errors.map(err => ({
            message: err.message,
            path: err.path,  // Indicating where the error occurred
            input: err.input   // The input value that failed validation
        }));

        // Log the error (optional but helpful for debugging)
        console.error('Validation error:', errorDetails);

        return res.status(400).json({ message: 'Validation error', errors: error.errors, })
    }
}


export default validateSchema;