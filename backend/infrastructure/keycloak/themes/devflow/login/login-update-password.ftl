<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
    <#elseif section = "form">
        <form id="kc-passwd-update-form" class="df-form" action="${url.loginAction}" method="post">
            <input type="text" id="username" name="username" value="${username}" autocomplete="username" readonly="readonly" style="display:none;">
            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;">

            <div class="df-field">
                <label for="password-new" class="df-label">${msg("passwordNew")}</label>
                <div class="df-input-wrap">
                    <input type="password" id="password-new" name="password-new" class="df-input" autofocus autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>">
                    <button type="button" class="df-password-toggle" data-password-toggle="password-new" aria-label="Show password" aria-pressed="false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password')>
                    <p class="df-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</p>
                </#if>
            </div>
            <div class="df-field">
                <label for="password-confirm" class="df-label">${msg("passwordConfirm")}</label>
                <div class="df-input-wrap">
                    <input type="password" id="password-confirm" name="password-confirm" class="df-input" autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>">
                    <button type="button" class="df-password-toggle" data-password-toggle="password-confirm" aria-label="Show password" aria-pressed="false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password-confirm')>
                    <p class="df-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</p>
                </#if>
            </div>
            <div class="df-actions">
                <#if isAppInitiatedAction??>
                    <input class="df-btn df-btn-primary" type="submit" value="${msg("doSubmit")}">
                    <button class="df-btn-ghost" type="submit" name="cancel-aia" value="true">${msg("doCancel")}</button>
                <#else>
                    <input class="df-btn df-btn-primary" type="submit" value="${msg("doSubmit")}">
                </#if>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
