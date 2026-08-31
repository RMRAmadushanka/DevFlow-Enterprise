<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        Welcome back
    <#elseif section = "form">
        <p class="df-subtitle" style="margin-top:-1rem;margin-bottom:1.5rem">Sign in to DevFlow Enterprise</p>
        <#if realm.password>
            <form id="kc-form-login" class="df-form" action="${url.loginAction}" method="post">
                <#if !usernameHidden??>
                    <div class="df-field">
                        <label class="df-label" for="username">
                            <#if !realm.loginWithEmailAllowed>
                                ${msg("username")}
                            <#elseif !realm.registrationEmailAsUsername>
                                ${msg("usernameOrEmail")}
                            <#else>
                                ${msg("email")}
                            </#if>
                        </label>
                        <input tabindex="1" id="username" class="df-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                               <#if messagesPerField.existsError('username','password')>aria-describedby="input-error"</#if>>
                        <#if messagesPerField.existsError('username','password')>
                            <p id="input-error" class="df-field-error">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</p>
                        </#if>
                    </div>
                </#if>

                <div class="df-field">
                    <label class="df-label" for="password">${msg("password")}</label>
                    <div class="df-input-wrap">
                        <input tabindex="2" id="password" class="df-input" name="password" type="password" autocomplete="current-password" placeholder="Enter your password"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>">
                        <button type="button" class="df-password-toggle" data-password-toggle="password" aria-label="Show password" aria-pressed="false">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                        <p class="df-field-error">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</p>
                    </#if>
                </div>

                <div class="df-row">
                    <#if realm.rememberMe && !usernameHidden??>
                        <label class="df-check">
                            <#if login.rememberMe??>
                                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked>
                            <#else>
                                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox">
                            </#if>
                            ${msg("rememberMe")}
                        </label>
                    <#else>
                        <span></span>
                    </#if>
                    <#if realm.resetPasswordAllowed>
                        <a class="df-link" tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                    </#if>
                </div>

                <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>>
                <div class="df-actions">
                    <input tabindex="4" class="df-btn df-btn-primary" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}">
                </div>
            </form>
        </#if>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            Don't have an account?
            <a class="df-link" href="${url.registrationUrl}">${msg("doRegister")}</a>
        </#if>
    <#elseif section = "socialProviders">
        <#if realm.password && social?? && social.providers?has_content>
            <div class="df-social">
                <p class="df-subtitle">${msg("identity-provider-login-label")}</p>
                <#list social.providers as p>
                    <a id="social-${p.alias}" class="df-btn df-btn-ghost" href="${p.loginUrl}">${p.displayName!}</a>
                </#list>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
