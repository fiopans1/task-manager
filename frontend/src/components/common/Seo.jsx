import { Helmet } from "react-helmet-async";
import configService from "../../services/configService";

const DEFAULT_DESCRIPTION =
    "Task Manager is a self-hosted task management platform for teams and individuals: tasks, custom lists, calendar planning, time tracking and OAuth2 login.";
const DEFAULT_OG_IMAGE = "/logo512.png";

function buildAbsoluteUrl(siteUrl, path) {
    if (!siteUrl) {
        return path;
    }
    if (!path) {
        return siteUrl;
    }
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${siteUrl}${normalized}`;
}

function Seo({
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image = DEFAULT_OG_IMAGE,
    type = "website",
    noindex = false,
    children,
}) {
    const siteUrl = configService.getSiteUrl();
    const canonical = buildAbsoluteUrl(siteUrl, path || (typeof window !== "undefined" ? window.location.pathname : "/"));
    const ogImage = buildAbsoluteUrl(siteUrl, image);
    const fullTitle = title ? `${title} · Task Manager` : "Task Manager — Self-hosted task management";

    return (
        <Helmet>
            <html lang="en" />
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <link rel="canonical" href={canonical} />
            )}

            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Task Manager" />
            <meta property="og:locale" content="en_US" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {children}
        </Helmet>
    );
}

export default Seo;
