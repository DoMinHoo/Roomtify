import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./untils";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId
        ? await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: "source" }) : null;

    const hostedRender = projectId && item.renderedImage
        ? await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: "rendered" }) : null;

    const resolvedSoure = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');

    if (!resolvedSoure) {
        console.warn("Failed to upload source image to hosting. Project will not be created.");
        return null;
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest

    } = item


    const payload = {
        ...rest,
        sourceImage: resolvedSoure,
        renderedImage: resolvedRender,
    }

    try {

        return payload
    } catch (error) {
        console.error(`Failed to create project: ${error}`);
        return null;
    }
}