{% extends '../../core/views/email.server.view.swig' %}

{% block content %}
<!-- ONE COLUMN SECTION -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td bgcolor="#ffffff" align="center" style="padding: 70px 15px 70px 15px;" class="section-padding">
      <table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <!-- HERO IMAGE -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td class="padding-copy">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <img src="{{app.publicAddress}}/assets/img/email/responsive-email.jpg" width="500" height="200" border="0" alt="Image" style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; width: 500px; height: 200px;" class="img-max">
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <!-- COPY -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="font-size: 25px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;" class="padding-copy">Dear <strong>{{user.name.full}}</strong>,</td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">
                      You have requested to have your password reset for your account at <strong>{{app.title}}</strong></td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">
                      Please visit the link bellow to reset your password.</td>
                    </tr>
                    <tr>
                      <td>
                        <!-- BULLETPROOF BUTTON -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                          <tr>
                            <td align="center" style="padding: 25px 0 0 0;" class="padding-copy">
                              <table border="0" cellspacing="0" cellpadding="0" class="responsive-table">
                                <tr>
                                  <td align="center"><a href="{{url}}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; font-weight: normal; color: #ffffff; text-decoration: none; background-color: #5D9CEC; border-top: 15px solid #5D9CEC; border-bottom: 15px solid #5D9CEC; border-left: 25px solid #5D9CEC; border-right: 25px solid #5D9CEC; border-radius: 3px; -webkit-border-radius: 3px; -moz-border-radius: 3px; display: inline-block;" class="mobile-button">Reset Password</a></td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">
                      If you didn't make this request, you can ignore this email.<br/><br/>
                      The <strong>{{app.title}}</strong> Support Team
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
{% endblock %}
