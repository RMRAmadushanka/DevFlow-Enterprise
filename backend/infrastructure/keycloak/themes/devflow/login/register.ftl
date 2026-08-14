<#import "template.ftl" as layout>
<#import "user-profile-commons.ftl" as userProfileCommons>
<#import "register-commons.ftl" as registerCommons>
<@layout.registrationLayout displayMessage=messagesPerField.exists('global') displayRequiredFields=true displayInfo=true; section>
    <#if section = "header">
        <#if messageHeader??>
            ${kcSanitize(msg("${messageHeader}"))?no_esc}
        <#else>
            Create your account
        </#if>
    <#elseif section = "form">
        <p class="df-subtitle" style="margin-top:-1rem;margin-bottom:1.5rem">Start collaborating with your engineering team</p>
        <form id="kc-register-form" class="df-form" action="${url.registrationAction}" method="post">
            <@userProfileCommons.userProfileFormFields; callback, attribute>
                <#if callback = "afterField">
                    <#if passwordRequired?? && (attribute.name == 'username' || (attribute.name == 'email' && realm.registrationEmailAsUsername))>
                        <div class="df-field">
                            <label for="password" class="df-label">${msg("password")} <span class="df-required">*</span></label>
                            <div class="df-input-wrap">
                                <input type="password" id="password" class="df-input" name="password" autocomplete="new-password" placeholder="Enter your password"
                                       aria-invalid="<#if messagesPerField.existsError('password')>true</#if>">
                                <button type="button" class="df-password-toggle" data-password-toggle="password" aria-label="Show password" aria-pressed="false">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                            </div>
                            <#if messagesPerField.existsError('password')>
                                <p class="df-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</p>
                            </#if>
                        </div>
                        <div class="df-field">
                            <label for="password-confirm" class="df-label">${msg("passwordConfirm")} <span class="df-required">*</span></label>
                            <div class="df-input-wrap">
                                <input type="password" id="password-confirm" class="df-input" name="password-confirm" autocomplete="new-password"
                                       aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>">
                                <button type="button" class="df-password-toggle" data-password-toggle="password-confirm" aria-label="Show password" aria-pressed="false">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                            </div>
                            <#if messagesPerField.existsError('password-confirm')>
                                <p class="df-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</p>
                            </#if>
                        </div>
                    </#if>
                </#if>
            </@userProfileCommons.userProfileFormFields>

            <@registerCommons.termsAcceptance/>

            <div class="df-actions">
                <input class="df-btn df-btn-primary" type="submit" value="${msg("doRegister")}"/>
            </div>
        </form>
    <#elseif section = "info">
        Already have an account?
        <a class="df-link" href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
    </#if>
</@layout.registrationLayout>
