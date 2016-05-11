# -*- coding: utf-8 -*-

import base64
from PIL import Image
import cStringIO
from django.views.generic import TemplateView
from django.http import JsonResponse


class SaveAvatarView(TemplateView):
    def post(self, request, *args, **kwargs):
        data = {
            'success': False,
        }
        pic = cStringIO.StringIO()

        import ipdb;ipdb.set_trace()
        image_data = request.POST['data']
        image_data = image_data.partition('base64',)[2]
        image_string = cStringIO.StringIO(base64.b64decode(image_data))
        image = Image.open(image_string)
        image.save(pic, image.format, quality=100)
        if request.is_ajax():
            pass
        return JsonResponse(data, content_type='application/json; charset=UTF-8')
