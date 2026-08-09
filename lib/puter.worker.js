const PROJECT_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch (error) {
        return null;
    }
}

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const listed = await userPuter.kv.list?.();
        const rawKeys = Array.isArray(listed)
            ? listed
            : listed?.keys || listed?.items || [];

        const projects = [];

        for (const entry of rawKeys) {
            const key = typeof entry === 'string' ? entry : entry?.key || entry?.name;

            if (typeof key === 'string' && key.startsWith(PROJECT_PREFIX)) {
                const value = await userPuter.kv.get(key);
                if (value !== undefined && value !== null) projects.push(value);
            }
        }

        return jsonResponse({ projects });
    } catch (error) {
        return jsonError(500, 'Failed to list projects', { message: error.message || 'Unknown error' });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project id is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        return jsonResponse({ project });
    } catch (error) {
        return jsonError(500, 'Failed to get project', { message: error.message || 'Unknown error' });
    }
});

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) return jsonError(400, 'Project not found');

        const payload = {
            ...project,
            updateAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return jsonResponse({ saved: true, id: project.id, project: payload });
    } catch (error) {
        return jsonError(500, 'Failed to save project', { message: error.message || 'Unknown error' });
    }
})

