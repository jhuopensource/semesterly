from django import forms

class FeatureForm(forms.Form):
    name = forms.CharField(label='name', max_length=256, required=True)
    email = forms.EmailField(max_length=256, required=True)
    feature_request = forms.CharField(required=True)

