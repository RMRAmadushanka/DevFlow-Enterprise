<#macro registrationLayout displayMessage=true displayInfo=false displayRequiredFields=false>
<!DOCTYPE html>
<html class="df-html"<#if locale??> lang="${locale.currentLanguageTag}"<#else> lang="en"</#if>>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName!'DevFlow'))}</title>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link rel="stylesheet" href="${url.resourcesPath}/${style}">
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" defer></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>
<body class="df-body">
<div class="df-page">
    <aside class="df-aside" aria-hidden="false">
        <div class="df-aside-wash"></div>
        <a class="df-brand" href="${(client.baseUrl)!'#'}">
            <img src="${url.resourcesPath}/img/logo.svg" alt="">
            DevFlow Enterprise
        </a>
        <div class="df-aside-copy">
            <h1 class="df-aside-heading">Ship with confidence</h1>
            <p class="df-aside-sub">Projects, deployments, and engineering operations in one secure workspace.</p>
        </div>
        <p class="df-aside-foot">&copy; ${.now?string["yyyy"]} DevFlow</p>
    </aside>

    <main class="df-main">
        <div class="df-col">
            <div class="df-mobile-brand">
                <a class="df-brand" href="${(client.baseUrl)!'#'}">
                    <img src="${url.resourcesPath}/img/logo.svg" alt="">
                    DevFlow Enterprise
                </a>
            </div>

            <div class="df-card">
                <header class="df-card-header">
                    <h1 class="df-title"><#nested "header"></h1>
                    <#if displayRequiredFields>
                        <p class="df-subtitle">* ${msg("requiredFields")}</p>
                    </#if>
                </header>

                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="df-alert df-alert-${message.type}" role="${(message.type == 'error')?then('alert','status')}">
                        ${kcSanitize(message.summary)?no_esc}
                    </div>
                </#if>

                <#nested "form">

                <#if auth?has_content && auth.showTryAnotherWayLink()>
                    <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post" class="df-form" style="margin-top:1rem">
                        <input type="hidden" name="tryAnotherWay" value="on">
                        <button type="submit" class="df-btn-ghost" name="tryAnotherWay" value="on">${msg("doTryAnotherWay")}</button>
                    </form>
                </#if>

                <#nested "socialProviders">
            </div>

            <#if displayInfo>
                <div class="df-footer df-info">
                    <#nested "info">
                </div>
            </#if>
        </div>
    </main>
</div>
</body>
</html>
</#macro>
