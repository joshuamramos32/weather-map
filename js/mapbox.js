"use strict";
mapboxgl.accessToken = mapBoxkey;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v12',
	center: [-98.23553, 29.59986],
	zoom: 12
});

const marker = new mapboxgl.Marker({
	color: "green",
	draggable: true
}).setLngLat([-98.23553, 29.59986])
	.addTo(map);

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

const coordinatesGeocoder = function (query) {
	const matches = query.match(
		/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
	);
	if (!matches) {
		return null;
	}

	function coordinateFeature(lng, lat) {
		return {
			center: [lng, lat],
			geometry: {
				type: 'Point',
				coordinates: [lng, lat]
			},
			place_name: 'Lat: ' + lat + ' Lng: ' + lng,
			place_type: ['coordinate'],
			properties: {},
			type: 'Feature'
		};
	}

	const coord1 = Number(matches[1]);
	const coord2 = Number(matches[2]);
	const geocodes = [];

	if (coord1 < -90 || coord1 > 90) {
		geocodes.push(coordinateFeature(coord1, coord2));
	}

	if (coord2 < -90 || coord2 > 90) {
		geocodes.push(coordinateFeature(coord2, coord1));
	}

	if (geocodes.length === 0) {
		geocodes.push(coordinateFeature(coord1, coord2));
		geocodes.push(coordinateFeature(coord2, coord1));
	}

	return geocodes;
};

map.addControl(
	new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		localGeocoder: coordinatesGeocoder,
		zoom: 12,
		placeholder:'search',
		mapboxgl: mapboxgl,
		reverseGeocode: true
	})
);

function weatherData(data) {
	let lat = 29.59986;
	let long = -98.23553;
	$.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + long + "&appid=" + weatherKey + "&units=imperial").done(function (data) {
		let report = data.list;
		let reports = "";
		for (let i = 0; i < report.length; i += 8) {
			reports += "<div class='futureforecast'>";
			reports += "<div class='day' id='day'>" + " " + report[i].dt_txt + "" + "</div>";
			reports += "<div class='weather-forecast' id='weather-forecast'>" + "Daily Temp" + " " + report[i].main.temp + "</div>";
			reports += "<div class='day' id='day'>" + " " + report[i].weather[0].description + "" + "</div>";
			reports += "<img src=\"http://openweathermap.org/img/wn/10d@2x.png\"alt=\"weather-icon\"/>";
			reports += "</div>";
		}
		$("#insertdata").html(reports);
	});
};
weatherData();

const currentMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let intervalID = setInterval(function () {
	const time = new Date();
	const year = time.getFullYear()
	const date = time.getDate();
	const hour = time.getHours();
	const hoursIn12 = hour >= 13 ? hour % 12 : hour;
	const minutes = time.getMinutes();
	const ampm = hour >= 12 ? 'PM' : "AM";
	$(".time").append().html(hoursIn12 + ":" + minutes + " " + ampm);
	$("#date").text(currentMonth[time.getMonth()] + ". " + "" + date + ", " + year);
}, 1000);
intervalID;