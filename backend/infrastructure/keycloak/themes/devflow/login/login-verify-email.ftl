<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
    <#if section = "header">
        Check your email
    <#elseif section = "form">
        <p class="df-instruction">${msg("emailVerifyInstruction1",user.email)}</p>
        <form id="kc-verify-email-form" class="df-form" action="${url.loginAction}" method="post">
            <div class="df-actions">
                <input class="df-btn df-btn-primary" type="submit" value="${msg("doClickHere")}">
            </div>
        </form>
    <#elseif section = "info">
        <p class="df-instruction">${msg("emailVerifyInstruction2")}</p>
        <p class="df-instruction">${msg("doClickHere")} ${msg("emailVerifyInstruction3")}</p>
    </#if>
</@layout.registrationLayout>
