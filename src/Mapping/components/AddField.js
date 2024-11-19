import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import Geocoder from './Geocoder';
import './crudForm.css';
import { useNavigate} from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import useLocalStorage from "use-local-storage";
import Modal from './Modal';

const { BaseLayer } = LayersControl;

const AddField = ({ onAddField }) => {
    const [drawnCoordinates, setDrawnCoordinates] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [produce, setProduce] = useState([{ produce_type: '', variety: '' }]);
    const [farmer, setFarmer] = useState('');
    const [farmers, setFarmers] = useState([]);
    const [farm_area, setFarmCood] = useState("");
    const [notification, setNotification] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [farmArea, setFarmArea] = useState(''); // New state for farm area

    const featureGroupRef = useRef(null);

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/fieldmapping/farmers/");
                setFarmers(res.data);
            } catch (error) {
                console.error("Error fetching farmers:", error);
            }
        };
        fetchFarmers();
    }, []);

    useEffect(() => {
      setFarmCood(drawnCoordinates);
    }, [drawnCoordinates]);

    const handleProduceChange = (index, field, value) => {
        const newProduce = [...produce];
        newProduce[index][field] = value;
        setProduce(newProduce);
    };

    const handleFieldAddition = async (e) => {
        e.preventDefault();

        if (!drawnCoordinates || !farmArea) {
            setNotification("Please draw the farm area on the map and input the area in acres before saving.");
            setTimeout(() => {
                setNotification("");
            }, 3000);
            return;
        }

        const fieldData = {
            name,
            description,
            farm_area,
            area_acres: farmArea, // Send area in acres
            farmer,
            produce,
        };

        console.log('Field Data to send:', fieldData);

        try {
            await axios.post('http://localhost:8000/api/fieldmapping/farms/', fieldData);
            // onAddField(fieldData);
            setName('');
            setDescription('');
            setProduce([{ produce_type: '', variety: '' }]);
            setFarmer('');
            setFarmArea(''); // Reset farm area after submission
            setFarmCood('');
            setDrawnCoordinates('');
            setIsModalOpen(true);
            if (featureGroupRef.current) {
              featureGroupRef.current.clearLayers();
            }
        } catch (error) {
            console.error('Error adding field:', error);
            setNotification('Error adding field. Please try again.');
            setTimeout(() => {
                setNotification('');
            }, 3000);
        }
    };

    const handleCreated = (e) => {
        const type = e.layerType;
        const layer = e.layer;
        if (type === "polygon") {
            const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
            if (latlngs[0] !== latlngs[latlngs.length - 1]) {
                latlngs.push(latlngs[0]);
            }
            const polygonString = `SRID=4326;POLYGON((${latlngs.join(", ")}))`;
            setDrawnCoordinates(polygonString);
        }
    };

    const navigate = useNavigate();

    const [isDark, setIsDark] = useLocalStorage("isDark", false);

    return (
      <>
        <div className="add-location-container">
          <div
            className="form-sidebar-container"
            data-theme={isDark ? "dark" : "mapping"}
          >
            <button
              className="back-button"
              onClick={() => navigate("/View Locations")}
            >
              <FaArrowLeft /> Back
            </button>
            <form className="add-field-form" onSubmit={handleFieldAddition}>
              <h2 className="LocationTitle">Add Field Drawing</h2>
              {notification && (
                <div className="notification">{notification}</div>
              )}
              <div className="form-control">
                <label>Field Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Field Name"
                  required
                />
              </div>
              <div className="form-control">
                <label>Farm Area (acres)</label>
                <input
                  type="number"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  placeholder="Enter farm area in acres"
                  required
                />
              </div>
              <div className="form-control">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                  rows="4"
                />
              </div>
              <div className="form-control">
                <label>Produce Farmed (at least one required)</label>
                {produce.map((prod, index) => (
                  <div key={index} className="produce-inputs">
                    <input
                      type="text"
                      placeholder={`Produce Type ${index + 1}`}
                      value={prod.produce_type}
                      onChange={(e) =>
                        handleProduceChange(
                          index,
                          "produce_type",
                          e.target.value
                        )
                      }
                      required={index === 0}
                    />
                    <input
                      className="produce"
                      type="text"
                      placeholder={`Variety ${index + 1}`}
                      value={prod.variety}
                      onChange={(e) =>
                        handleProduceChange(index, "variety", e.target.value)
                      }
                      required={index === 0}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setProduce([...produce, { produce_type: "", variety: "" }])
                  }
                >
                  Add Produce
                </button>
              </div>
              <div className="form-control">
                <label>Farmer</label>
                <select
                  value={farmer}
                  onChange={(e) => setFarmer(e.target.value)}
                  required
                >
                  <option value="">Select Farmer</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label>Farm Area Coordinates</label>
                <textarea
                  value={farm_area}
                  onChange={(e) => setFarmCood(e.target.value)}
                  rows="5"
                  readOnly
                />
              </div>
              <button className="btn" type="submit">
                Save Field
              </button>
            </form>
            <div className="home-button" onClick={() => navigate("/")}>
              SUPPLY2U{" "}
            </div>
          </div>
          <MapContainer center={[0, 38]} zoom={8} className="leaflet-container">
            <Geocoder />
            <LayersControl position="topright">
              <BaseLayer checked name="Google Hybrid Map">
                <TileLayer
                  url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                  attribution="&copy; Google Maps"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                  maxZoom={23}
                />
              </BaseLayer>
              <BaseLayer name="Esri World">
                <TileLayer
                  url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                  maxZoom={20}
                />
              </BaseLayer>
            </LayersControl>
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Success"
        >
          <p>Field added successfully.</p>
        </Modal>
      </>
    );
};

export default AddField;
