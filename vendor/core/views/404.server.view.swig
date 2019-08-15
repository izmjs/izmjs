{% extends './layout.server.view.swig' %}

{% block content %}
<h1>{{ title }}</h1>
<div class="alert alert-danger" role="alert">
  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
  {{ details | safe }}
</div>
{% endblock %}
