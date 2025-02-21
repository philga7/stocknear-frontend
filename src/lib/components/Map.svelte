<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import "ol/ol.css";
  import Map from "ol/Map";
  import View from "ol/View";
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import { fromLonLat } from "ol/proj";
  import VectorLayer from "ol/layer/Vector";
  import VectorSource from "ol/source/Vector";
  import Feature from "ol/Feature";
  import Point from "ol/geom/Point";
  import { Style, Circle, Fill } from "ol/style";
  import { defaults as defaultInteractions } from "ol/interaction";

  // White House coordinates
  const LON = -77.0365427;
  const LAT = 38.8950368;
  const ZOOM = 4.5;

  let mapElement;
  let map;
  let animationFrame;
  let pulseProgress = 0;
  let vectorLayer;

  // Pulsing style function
  const createPulseStyle = (progress) => {
    return new Style({
      image: new Circle({
        radius: 6 + 9 * progress,
        fill: new Fill({
          color: `rgba(46, 134, 222, ${0.3 - 0.3 * progress})`,
        }),
      }),
    });
  };

  // Animation loop function
  const animate = () => {
    pulseProgress = (pulseProgress + 0.02) % 1;
    const feature = vectorLayer.getSource().getFeatures()[0];
    if (feature) {
      feature.setStyle([
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: "#2e86de" }),
          }),
        }),
        createPulseStyle(pulseProgress),
      ]);
    }
    animationFrame = requestAnimationFrame(animate);
  };

  onMount(() => {
    if (!browser) return;

    // Determine if the user is on a mobile device.
    // Here we use a simple viewport width check—adjust the threshold if needed.
    const isMobile = window.innerWidth <= 640;

    const whiteHousePoint = new Feature({
      geometry: new Point(fromLonLat([LON, LAT])),
    });

    vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [whiteHousePoint],
      }),
    });

    map = new Map({
      target: mapElement,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([LON, LAT]),
        zoom: ZOOM,
        minZoom: 2,
        maxZoom: 18,
      }),
      controls: [],
      // For mobile devices, disable all interactions to prevent dragging or zooming.
      interactions: isMobile
        ? []
        : defaultInteractions({
            mouseWheelZoom: false, // Disable scroll zoom on desktop as well
            pinchZoom: false, // Disable pinch-to-zoom on desktop
          }),
    });

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (map) {
        map.setTarget(undefined);
      }
    };
  });
</script>

<div bind:this={mapElement} class="map-container" />

<style>
  .map-container {
    width: 100%;
    height: 500px;
    background-color: #1a1a1a;
    overflow: hidden;
    border-radius: 10px;
  }

  @media (max-width: 640px) {
    .map-container {
      height: 300px;
    }
  }
</style>
