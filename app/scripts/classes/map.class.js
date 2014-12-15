Object.defineProperties(google.maps.LatLng.prototype, {
	x: {
		get() {
			return this.lng();
		}
	},
	y: {
		get() {
			return this.lat();
		}
	},
	toString: {
		value: () => {
			return `[${ this.x },${ this.y }]`;
		}
	}
});