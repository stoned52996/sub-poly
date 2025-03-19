class ResponseUtil {
    static success(data = null, message = 'success', code = 200) {
        return new Response(JSON.stringify({
            code: code,
            message: message,
            data: data
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    static error(message = 'error', code = 500) {
        return new Response(JSON.stringify({
            code: code,
            message: message,
            data: null
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export default ResponseUtil;