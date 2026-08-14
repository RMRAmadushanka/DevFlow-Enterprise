<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        Forgot password
    <#elseif section = "form">
        <p class="df-subtitle" style="margin-top:-1rem;margin-bottom:1.5rem">We'll email you a link to reset it</p>
        <form id="kc-reset-password-form" class="df-form" action="${url.loginAction}" method="post">
            <div class="df-field">
                <label for="username" class="df-label">
                    <#if !realm.loginWithEmailAllowed>
                        ${msg("username")}
                    <#elseif !realm.registrationEmailAsUsername>
                        ${msg("usernameOrEmail")}
                    <#else>
                        ${msg("email")}
                    </#if>
                </label>
                <input type="text" id="username" name="username" class="df-input" autofocus value="${(auth.attemptedUsername!'')}" autocomplete="username"
                       aria-invalid="<#if messagesPerField.existsError('username')>true</#if>">
                <#if messagesPerField.existsError('username')>
                    <p class="df-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</p>
                </#if>
            </div>
            <div class="df-actions">
                <input class="df-btn df-btn-primary" type="submit" value="${msg("doSubmit")}">
            </div>
        </form>
    <#elseif section = "info">
        <a class="df-link" href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
        <p class="df-instruction" style="margin-top:0.75rem">
            <#if realm.duplicateEmailsAllowed>
                ${msg("emailInstructionUsername")}
            <#else>
                ${msg("emailInstruction")}
            </#if>
        </p>
    </#if>
</@layout.registrationLayout>
