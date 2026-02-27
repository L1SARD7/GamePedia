export let HTTP_CODES = {
    OK_200: 200,
    Created_201: 201,
    Deleted_204: 204,
    BAD_REQUEST_400: 400,
    Unauthorized_401: 401,
    NOT_FOUND_404: 404
}

export const JWT_Secret = process.env.JWT_Secret || "123"