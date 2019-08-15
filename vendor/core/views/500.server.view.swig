{% extends './layout.server.view.swig' %}

{% block content %}
<h1>{{ title }}</h1>
<pre>
  {{ error }}
</pre>
{% endblock %}
