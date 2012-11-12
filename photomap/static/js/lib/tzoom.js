/**
 * T Squares Image Zoom v1.0 - http://tsquares.net/
 *
 * depends:
 * 		jQuery 1.3.2 or later
 * 		jQuery UI 1.8 or later
 *
 * TERMS OF USE
 * Open source under The New BSD License 
 * 
 * Copyright (c) 2011, Tom Collins
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *	1.  Redistributions of source code must retain the above copyright
 *		notice, this list of conditions and the following disclaimer.
 *  2.	Redistributions in binary form must reproduce the above copyright
 *    	notice, this list of conditions and the following disclaimer in the
 *    	documentation and/or other materials provided with the distribution.
 * 	3. 	Neither the name of T Squares nor the names of its contributors may be 
 * 		used to endorse or promote products derived from this software without 
 * 		specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function($, undefined) {
	$.widget("ui.tzoom", {
			
		version: "1.0",
		
		options: {
			image: null,
			imageSrc: null,
			lazySrc: null,
			loadingImage: null,
			loadingImageSrc: null,
			slider: null,
			decreaseBtn: null,
			increaseBtn: null,
			wheelEnabled: true,
			buttonStep: 25,
			wheelStep: 15,
			easing: "swing",
			duration: 300,
			wheelEasing: "swing",
			wheelDuration: 150,
			fadeIn: "slow",
			zoomCursor: "move",
			staticCursor: "auto",
			fixed: false,
			scaleUp: false,
			onLoad: null,
			onLazy: null,
			onReady: null,
			onZoom: null,
			onZoomed: null,
			onError: null
		},
		
		// ----- private methods ----->>
		_create: function() {
			var thiz = this,
				elem = this.element,
				wheelClosure;
			
			elem.addClass("tzoom-viewport");
				
			// internal variables
			this._val = 0;
			this._view = {
				"top": 0,
				"left": 0,
				"width": this.options.fixed ? elem.width() : Math.max(elem.width(), elem.height()),
				"height": this.options.fixed ? elem.height() : Math.max(elem.width(), elem.height())
			};
			this._setDimensions();
			this._sliderMoved = null;
			this._disabled = true;
			
            // ----- initializing the controls ----->>
            
            if (this.options.slider)
				this._setSlider(this.options.slider);
				
			if (this.options.decreaseBtn)
				this._setDecreaseBtn(this.options.decreaseBtn);
				
			if (this.options.increaseBtn)
				this._setIncreaseBtn(this.options.increaseBtn);
      			
	        if (typeof $.event.special.mousewheel != 'undefined')
	        {
	        	wheelClosure = function(event, delta) {
	        		thiz._onMousewheel(event, delta);
	        	};
	            this.element.mousewheel(wheelClosure);
	            if (this.options.slider)
	            	$(this.options.slider).mousewheel(wheelClosure);
            }
            
            if (this.options.image)
            	this.image(this.options.image);
            else if (this.options.imageSrc)
            	this.imageSrc(this.options.imageSrc);
            	
            if (!this.options.onError)
            {
            	this.options.onError = function() {
            		thiz._error.call(thiz);
            	}
            }
            	
            this.disable();
            
            // <<----- initializing the controls -----
		},
		
		_setOption: function(option, value) {
			switch(option) {
				case "imageSrc":
					this.imageSrc(value);
					break;
				case "image":
					this.image(value);
					break;
				case "slider":
					this._setSlider(value);
					break;
				case "decreaseBtn":
					this._setDecreaseBtn(value);
					break;
				case "increaseBtn":
					this._setIncreaseBtn(value);
					break;
			}
			
			$.Widget.prototype._setOption.apply(this, arguments); 
		},
		
		_setSlider: function(slider) {
			var thiz = this;
           	if (this.options.slider)
           		this._destroyControl(this.options.slider);
           	this.options.slider = slider;
           	
           	if (slider)
           	{
				$(slider).slider({
						min: 0,
						max: 100,
						step: 1,
						change: function(event, ui) {
	       					if (!thiz._sliderMoved)
	       						thiz.value(ui.value);
	       					else
	       						delete thiz._sliderMoved;
	       				}
     			});
     			$(slider).addClass("tzoom-control");
     		}
		},
		
		_setDecreaseBtn: function(btn) {
			var thiz = this;
			if (this.options.decreaseBtn)
				this._destroyControl(this.options.decreaseBtn);
			this.options.decreaseBtn = btn;
		
			if (btn)
			{
				$(btn).click(function(event, ui) {
					var v = thiz._val - thiz.options.buttonStep;
					thiz.value(v);
       			});
       			$(btn).addClass("tzoom-control");
       		}
		},
		
		_setIncreaseBtn: function(btn) {
			var thiz = this, v;
			
			if (this.options.increaseBtn)
				this._destroyControl(this.options.increaseBtn);
			this.options.increaseBtn = btn;
			
			if (btn)
			{
				$(btn).click(function(event, ui) {
					v = thiz._val + thiz.options.buttonStep;
					thiz.value(v);
           		});
           		$(btn).addClass("tzoom-control");
			}
		},
		
		_onMousewheel: function(event, delta) {
			if (this.options.wheelEnabled && delta)
			{
				var d, v;
				// prevents the window from scrolling when the image is zoomable
				event.preventDefault();
				// rounding to the nearest integer for responsive zooming with all wheel types
				d = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
				v = this._val + (d * this.options.wheelStep);
				this.value(v, {"duration": this.options.wheelDuration, "easing": this.options.wheelEasing});
			}
			return false;
		},
		
		_moveSlider: function(value) {
			if (this.options.slider && !this._disabled)
			{
				// used to track the last programmatic slider change
				this._sliderMoved = true;
				$(this.options.slider).slider("value", value);
			}
		},
		
		_value: function(val) {
			if (!val && val !== 0)
				return false;
			if (this._val == 0 && val <= 0)
				return false;
			if (this._val == 100 && val >= 100)
				return false;
			
			// limits the value to 0 - 100
			this._val = Math.min(Math.max(val, 0), 100);
			// this._setButtonsEnabled();
			return true;
		},
		
		/*
		_setButtonsEnabled: function() {
			var dec = this.options.decreaseBtn,
				inc = this.options.increaseBtn;
				
			if (dec)
			{
				dec = $(dec);
				if (this._val <= 0)
				{
					if (dec.button)
						dec.button("disable");
					else
						dec.attr("disabled", "disabled");
				}
				else
				{
					if (dec.button)
						dec.button("enable");
					else
						dec.removeAttr("disabled");
				}
			}
			if (inc)
			{
				inc = $(inc);
				if (this._val >= 100)
				{
					if (inc.button)
						inc.button("disable");
					else
						inc.attr("disabled", "disabled");
				}
				else
				{
					if (inc.button)
						inc.button("enable");
					else
						inc.removeAttr("disabled");
				}
			}
		},
		*/
		
		_zoom: function(overrides) {
        	overrides = overrides || {};
			var thiz = this,
        		s = this._size(),
        		img = $(this._img),
        		p,
        		c,
        		easing,
        		duration;
        		
        		easing = overrides.easing ? overrides.easing : this.options.easing;
        		duration = overrides.duration ? overrides.duration : this.options.duration;
        	
        	if (s.width != img.width())
        	{
	        	p = this._position();
        		c = this._containment();
	            img.animate($.extend({}, p, s), duration, easing, function() {
	            	img.draggable("option", "containment", c);
	            	
	            	if (thiz.options.onZoomed)
	            		thiz.options.onZoomed.call(img, thiz._val);
	            });
        	}
		},
		
		_testImage: function(image) {
			var i = $(image);
			if (this._img && i.attr("src") == this._img.attr("src"))
			{
				return false;
			}
			else if (!i.length)
			{
				this._clear();
				return false;
			}
			else
			{
				return true;
			}
		},
		
		_image: function(image, lazySrc) {
			// remove the previous error message, if any
			this.element.find(".tzoom-error").remove();
			// delete the current lazy src if one exists
			delete this.options.lazySrc;
			// this is where the image and the lazy image source is set
			this._img = $(image);
			if (lazySrc)
				this.options.lazySrc = lazySrc;
		},
		
		_prepareImage: function(lazy) {
			var thiz = this,
				elem = this.element,
				dim,
				view,
				ratio,
				vProps;
			
			// make sure the image is hidden before doing anything
			this._img.hide();
			
			this._clearValues();
			this.disable();
			if (!lazy)
				elem.find(".tzoom-image").remove();
				        	
        	// if the image has already been loaded (cache or whatever)...
        	if (!this._img.get(0).complete)
        		this._loadingImage();
        	
        	// set the image load error handler
        	if (this.options.onError)
        		this._img.error(this.options.onError);
        	
        	this._load(this._img, function() {
				// remove the loading image, if any
				thiz._loadingImage(true);
				// set the image max, min, and zoom difference for the image
				dim = thiz._setDimensions(thiz._img);
				view = thiz._view;
				// call the onLoad event, if any
   				if (thiz.options.onLoad)
   					thiz.options.onLoad.call(thiz._img);
   				
   				// if the viewport is fixed, call onViewportReady directly
   				// otherwise, animate any viewport size changes and then call onViewportReady
				if (!thiz.options.fixed || view.width != elem.width() || view.height != elem.height())
				{
					// get the image's aspect ratio
					ratio = thiz._aspectRatio(dim.max.width, dim.max.height);
					vProps = thiz._viewportBounds(ratio);
					thiz.element.animate(vProps, thiz.options.duration, thiz.options.easing, function() {
						thiz._onViewportReady(lazy);
					});
				}
				else
				{
					thiz._onViewportReady(lazy);
				}
        	});
		},
		
		_onViewportReady: function(lazy) {
			// the image must be appended before position is called and it should be hidden
			this.element.append(this._img);
			
			var thiz = this,
				i = $(this._img),
				pos = this._position(),
				size = this._size(),
				css,
				canZoom;
				
			css = $.extend({ }, pos, size);
			canZoom = this._dim.diff.width >= 0 || this._dim.diff.height >= 0;
			
			// remove the viewport's remaining zoom image, if any
			this.element.find(".tzoom-image").remove();
			
			i.addClass("tzoom-image");
   			
   			// if the image is zoomable or a proxy set the zoomable css properties
			// otherwise, configure the static, non-zoomable image   			
   			if (canZoom || this.isProxy())
   			{
				i.css(css);
				i.css("cursor", this.options.zoomCursor);
	   			// if the image is a proxy, don't set the image as draggable
				if (!this.isProxy())
				{
	    	        i.draggable({
	    	        	cursor: this.options.zoomCursor,
	    	        	containment: this._containment()
	    	       	});
				}
    	        this.enable();
   			}
			else
			{
				// scale the image up to the viewport size or simply center the image
				if (this.options.scaleUp)
					i.css(css);
				else
					this._centerImage(i);
				
				// disable the controls
				this.disable();
				i.removeClass("tzoom-disabled");
				i.addClass("tzoom-image-static");
				i.css("cursor", this.options.staticCursor);
			}

			// finally, showing the image
			// if lazy loading simply display the image and invoke the lazy zoom callback
   			if (lazy)
   			{
   				i.show();
 				lazy.call(this);
   				if (this.options.onReady)
   					this.options.onReady.call(i, canZoom);
   			}
   			else
   			{
   				i.fadeIn(this.options.fadeIn, function() {
   					if (thiz.options.onReady)
   						thiz.options.onReady.call(i, canZoom);
   				});
   			}
		},
		
		_loadingImage: function(remove) {
			var thiz = this,
				li;
			
			if (!remove)
			{
				if (this._loadingImg)
					return;
			
				if (this.options.loadingImage)
					li = $(this.options.loadingImage).hide();
				else if (this.options.loadingImageSrc)
					li = $("<img />").attr("src", this.options.loadingImageSrc).hide();
				
				if (li && li.length)
				{
					this._loadingImg = li;
					this._load(li, function() {
						if (thiz.element.find(".tzoom-error").length == 0)
						{
							li.addClass("tzoom-image-loading");
							li.show();
							thiz._centerImage(li, true);
							thiz.element.append(li);
						}
					});
				}
			}
			else if (this._loadingImg)
			{
				this._loadingImg.remove();
				delete this._loadingImg;
			}
		},
		
		_centerImage: function(image, imageOffset) {
			var iSrc = new Image(),
				e = this.element,
				viewH = e.height(),
				viewW = e.width(),
				imgH,
				imgW,
				top,
				left,
				currImg;
			
			iSrc.src = $(image).attr("src");
			imgH = iSrc.height;
			imgW = iSrc.width;
			top = ((viewH - imgH) * .5);
			left = ((viewW - imgW) * .5);
				
			if (imageOffset)
			{
				currImg = this.element.find(".tzoom-image");
				if (currImg.length && currImg.is(":visible"))
				{
					top -= currImg.height();
					// left += currImg.width();
				}
			}
			
			image.css({top: top, left: left});
		},
		
		_load: function(image, callback) {
			if (image)
			{
	        	// if the image has already been loaded (cache or whatever)...
	        	if (image.get(0).complete)
	        		callback.call(this);
	        	else
	        		image.load(callback);
			}
		},
		
	   	_error: function() {
			var div = $("<div></div>"),
				icon = $("<span></span>"),
				msg = $("<strong></strong>"),
				p = $("<p></p>");
			
			div.addClass("tzoom-error").addClass("ui-state-error").addClass("ui-corner-all");
			icon.addClass("ui-icon").addClass("ui-icon-alert");
			msg.html("Unable to load zoom image.");
			
			div.append(p);
			p.append(icon);
			p.append(msg);
			this.element.find(".tzoom-image-loading").remove();
			this.element.append(div);
	   	},
		
        _setDimensions: function(image) {
     		var dim,
				e = this.element,
	        	i = $(image),
	        	src = new Image(),
	        	ratio,
	        	mxV,
	        	mnV;
     		
     		dim = {
     			max: {width: 0, height: 0},
     			min: {width: 0, height: 0},
     			diff: {width: 0, height: 0}
     		};
     		
     		dim.toString = function() {
     			return "max.width: " + this.max.width
     				+ ", max.height: " + this.max.height
     				+ ", min.width: " + this.min.width
     				+ ", min.height: " + this.min.height
     				+ ", diff.width: " + this.diff.width
     				+ ", diff.height: " + this.diff.height;
     		};
     		
     		if (image)
     		{
				// get the actual full size of the image from the image source
				// i.get(0) could be used to get the actual DOM image, but then there's IE 9...
				src.src = i.attr("src");
				
				// setting max
				dim.max.width = src.width;
				dim.max.height = src.height;
				
	        	// setting min
	        	ratio = this._aspectRatio(dim.max.width, dim.max.height);
        		mxV = Math.max(this._view.width, this._view.height);
        		mnV = Math.min(this._view.width, this._view.height);
	        	
	        	dim.min.width = Math.round(mxV * ratio.width),
	        	dim.min.height = Math.round(mxV * ratio.height)
	        	
	        	if (dim.min.width > e.width() || dim.min.height > e.height())
	        	{
	        		dim.min.width = Math.round(mnV * ratio.width);
	        		dim.min.height = Math.round(mnV * ratio.height);
	        	}
	        	
	        	// setting diff
            	dim.diff.width = dim.max.width - dim.min.width, 
            	dim.diff.height = dim.max.height - dim.min.height
        	}
        	
        	this._dim = dim;
            return dim;
        },
		
		_viewportBounds: function(ratio) {
			if (this.options.fixed)
			{
				return this._view;
			}
			else
			{
				var size,
					top = this._view.top,
					left = this._view.left,
					pos;
					
				size = {
					"width": Math.round(this._view.width * ratio.width),
					"height": Math.round(this._view.height * ratio.height)
				};
					
				if (size.width < size.height)
					left += Math.round((size.height - size.width) * .5);
				else if (size.height < size.width)
					top += Math.round((size.width - size.height) * .5);
					
				pos = {
					"top": top,
					"left": left
				};
				
				return $.extend({}, size, pos);
			}
		},
		
		_aspectRatio: function(w, h) {
			return {
				width: w && h && w < h ? w / h : 1,
				height: w && h && h < w ? h / w : 1
			};
		},
        
        _zoomDiff: function() {
            var dim = this._dim,
            	scale = (this._val * .01);
        	return {
        		width: Math.round(dim.diff.width * scale), 
        		height: Math.round(dim.diff.height * scale)
        	};
        },
        
        _size: function() {
            var dim = this._dim,
            	zDiff = this._zoomDiff();
            return {
            	width: dim.min.width + zDiff.width,
            	height: dim.min.height + zDiff.height
            };
        },
        
        _containment: function() {
     	    // start point is the viewport's top left corner
        	var e = this.element,
        		size = this._size(),
        		l = e.offset().left,
        		t = e.offset().top,
        		r = e.offset().left,
        		b = e.offset().top;
            
            // adjust for the viewport's padding and borders
            l += (e.outerWidth() - e.width()) * .5;
            t += (e.outerHeight() - e.height()) * .5;
            r += (e.outerWidth() - e.width()) * .5;
            b += (e.outerHeight() - e.height()) * .5;
            
            // adjust for aspect ratio of image
			if (size.width < e.width())
			{
				wDiff = Math.round((e.width() - size.width) * .5);
				l += wDiff;
				r += wDiff;
			}
            if (size.height < e.height())
			{
				hDiff = Math.round((e.height() - size.height) * .5);
				t += hDiff;
				b += hDiff;
			}
            
            // adjust for current image size
            if (size.width > e.width())
            	l -= size.width - e.width();
            if (size.height > e.height())
            	t -= size.height - e.height();

            return [l, t, r, b];
        },
        
        _position: function() {
        	var e = this.element,
        		size = this._size(),
        		pos = $(this._img).position(),
        		wDiff,
        		hDiff,
        		left,
        		top,
        		p;

            // how much +/- the current size is off of the set zoom value
            wDiff = size.width - $(this._img).width();
           	hDiff = size.height - $(this._img).height();
           	// initially, th new positions are current positions + .5 of zoom
           	left = wDiff ? (-Math.round(wDiff * .5) + pos.left) : 0;
			top = hDiff ? (-Math.round(hDiff * .5) + pos.top) : 0;
            
            // this centers the image horizontally if the image width is smaller than the viewport's width
            if (size.width < e.width())
            	left = Math.round((e.width() - size.width) * .5);
            // this ensures there's no empty space on the left
            else if (left > 0)
            	left = 0;
            // this ensures there's no empty space on the right
            else if (left < (e.width() - size.width))
            	left = e.width() - size.width;
            
			// this centers the image vertically if the image height is smaller than the viewport's height            	
            if (size.height < e.height())
            	top = Math.round((e.height() - size.height) * .5);
            // this ensures there's no empty space on the top
            else if (top > 0)
            	top = 0;
            // this ensures there's no empty space on the bottom
            else if (top < (e.height() - size.height))
            	top = e.height() - size.height;
            
            p = {
            	"left": left, 
            	"top": top
           	};
           	
           	return p;
        },
        
		_disableControl: function(control) {
			if (control)
			{
				var ctrl = $(control);
				ctrl.addClass("tzoom-disabled");
				if (ctrl.draggable && ctrl.is(":data(draggable)"))
					ctrl.draggable("disable");
				if (ctrl.slider && ctrl.is(":data(slider)"))
					ctrl.slider("disable");
				if (ctrl.button && ctrl.is(":data(button)"))
					ctrl.button("disable");
				if (ctrl.is("input"))
					ctrl.attr("disabled", true);
				if (ctrl.is("button"))
					ctrl.attr("disabled", true);
			}
		},
		
		_enableControl: function(control) {
			if (control)
			{
				var ctrl = $(control);
				ctrl.removeClass("tzoom-disabled");
				if (ctrl.draggable && ctrl.is(":data(draggable)"))
					ctrl.draggable("enable");
				if (ctrl.slider && ctrl.is(":data(slider)"))
					ctrl.slider("enable");
				if (ctrl.button && ctrl.is(":data(button)"))
					ctrl.button("enable");
				if (ctrl.is("input"))
					ctrl.removeAttr("disabled");
				if (ctrl.is("button"))
					ctrl.removeAttr("disabled");
			}
		},
		
		_destroyControl: function(control) {
			if (control)
			{
				var ctrl = $(control);
				ctrl.removeClass("tzoom-viewport")
					.removeClass("tzoom-image")
					.removeClass("tzoom-image-loading")
					.removeClass("tzoom-image-static")
					.removeClass("tzoom-control")
					.removeClass("tzoom-disabled")
					.removeClass("tzoom-error");
				
				if (typeof $.event.special.mousewheel != 'undefined')
					ctrl.unbind("mousewheel");
				if (ctrl.draggable && ctrl.is(":data(draggable)"))
					ctrl.draggable("destroy");
				if (ctrl.slider && ctrl.is(":data(slider)"))
					ctrl.slider("destroy");
				if (ctrl.button && ctrl.is(":data(button)"))
					ctrl.button("destroy");
			}
		},
		
		_clearValues: function() {
			this._moveSlider(0);
			this._setDimensions();
			this._val = 0;
		},
		
		_clearImage: function() {
			this._destroyControl(this._img);
			if (this._img)
				$(this._img).remove();
			if (this.options.lazySrc)
				delete this.options.lazySrc;
			this._loadingImage(false);
			this.element.find(".tzoom-error").remove();
			delete this._img;
		},
		
		_clear: function() {
			this._clearValues();
			this.disable();
			this._clearImage();
		},
		
		// <<----- private methods -----
		
		// ----- public methods ----->>
		
		value: function(val, overrides) {
			var thiz = this,
				stop,
				i;
		
			if (typeof val === "undefined")
				return this._val;
		
			if (this._disabled)
				return;
			
			// call the onZoom handler, if any
        	if (this.options.onZoom)
        	{
        		// if the onZoom handler returned false, prevent the zoom
        		stop = this.options.onZoom.call(this._img, this._val);
        		if (stop === false)
        			return;
        	}

			this._moveSlider(val);
			
			// if zooming in and the image is a lazy proxy, load the zoomable image
			// otherwise, simply perform the zoom
			if (val > 0 && this.isProxy())
			{
				this.disable();
				// create a new image using the lazy source
				i = $("<img />");
				i.attr("src", this.options.lazySrc);
				
				// if the image was successfully set, prepare the image and pass the zoom closure
				if (this._testImage(i))
				{
					this._image(i);
					// call the onLazy handler, if any
					if (this.options.onLazy)
						this.options.onLazy.call(i, val);
					
					this._prepareImage(function() {
						if (thiz._value(val))
							thiz._zoom(overrides);
					});
				}
			}
			else
			{
				if (this._value(val))
					this._zoom(overrides);
			}
			
			return true;
		},
		
		imageSrc: function(src, lazySrc) {
			var i = $("<img />");
			i.attr("src", src);
			this.image(i, lazySrc);
		},
		
		image: function(image, lazySrc) {
			var canSet = false;
		
			if (typeof image === "undefined")
			{
				return this._img;
			}
			else
			{
				canSet = this._testImage(image);
				if (canSet)
				{
					this._image(image, lazySrc);
					this._prepareImage();
				}
			}
		},
		
		disable: function() {
			this._disabled = true;
			this._disableControl(this._img);
			this._disableControl(this.options.slider);
			this._disableControl(this.options.decreaseBtn);
			this._disableControl(this.options.increaseBtn);
			
			return this;
		},
		
		enable: function() {
			delete this._disabled;
			this._enableControl(this._img);
			this._enableControl(this.options.slider);
			this._enableControl(this.options.decreaseBtn);
			this._enableControl(this.options.increaseBtn);
			
			return this;
		},
		
		destroy: function() {
			this._clearImage();
			this._clearValues();
			this._destroyControl(this._img);
			this._destroyControl(this.options.slider);
			this._destroyControl(this.options.descreaseBtn);
			this._destroyControl(this.options.increaseBtn);
			this._destroyControl(this.element);
			
			return this;
		},
		
		isProxy: function() {
			return this._img && this.options.lazySrc && this._img.attr("src") !== this.options.lazySrc;
		}
       	
		// <<----- public methods -----
	});
})(jQuery);
