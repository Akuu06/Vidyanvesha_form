export const API_CONTS = {
    FORMS: {
        LIST: "/forms",
        CREATE: "/forms",
        UPDATE: "/forms/:id",
        DELETE: "/forms/:id",
        GET: "/forms/:id",
    },
    RESPONSES: {
        LIST: "/form-responses/",
        CREATE: "/form-responses/",
        UPDATE: "/form-responses/:id/",
        DELETE: "/form-responses/:id/",
        GET: "/form-responses/:id/",
    },
    SETTINGS: {
        LIST: "/settings",
        CREATE: "/settings",
        UPDATE: "/settings/:id",
        DELETE: "/settings/:id",
        GET: "/settings/:id",
    },
    FORM_SECTIONS: {
        LIST: "/form-sections/",
        CREATE: "/form-sections/",
        UPDATE: "/form-sections/:id/",
        DELETE: "/form-sections/:id/",
        GET: "/form-sections/:id/",
    },
    QUESTION_POOLS: {
        LIST: "/question-pools/",
        CREATE: "/question-pools/",
        UPDATE: "/question-pools/:id/",
        DELETE: "/question-pools/:id/",
        GET: "/question-pools/:id/",
    },
    FORM_QUESTIONS: {
        LIST: "/form-questions/",
        CREATE: "/form-questions/",
        UPDATE: "/form-questions/:id/",
        DELETE: "/form-questions/:id/",
        GET: "/form-questions/:id/",
    }
}