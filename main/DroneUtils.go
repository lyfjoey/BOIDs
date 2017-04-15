package main

import "math"

/**
  This class is intended to encapsulate all the physical attributes and actions of a single drone.
*/

// 3D position of the drone
type Position struct {
	X float64 `json: "x"`
	Y float64 `json: "y"`
	Z float64 `json: "z"`
}

// Dimensional velocities
type Speed struct {
	VX float64 `json: "vX"`
	VY float64 `json: "vY"`
	VZ float64 `json: "vZ"`
}

// Any set of X, Y and Z dimensions
type Dimensions struct {
	DX float64 `json: "dX"`
	DY float64 `json: "dY"`
	DZ float64 `json: "dZ"`
}

// Attributes for a certain type of drone : e.g. a DJI Phantom X2
type DroneType struct {
	TypeId          string     `json: "id"`          // Identifier for a type
	TypeDescription string     `json: "description"` // Description
	Size            Dimensions `json: "size"`        // Size of this drone type
	MaxRange        Dimensions `json: "maxRange"`    // Max communication range for this drone type
	MaxSpeed        Speed      `json: "maxSpeed"`    // Maximum speed for this drone type
}

// Drone object with all attributes for one running drone
type DroneObject struct {
	Pos   Position  `json:"pos"`
	Type  DroneType `json:"type"`
	Speed Speed     `json:"speed"`
}

// System representation of a drone including ID, URL, paxos role etc.
type Drone struct {
	ID			string		`json: "id"`
	Address		string		`json: "address"`
	paxosRole	string		`json: "paxosRole"`
	DroneObject	DroneObject	`json: "droneObject"`
}

func (d Drone) moveTo(newPos Position, speed Speed) (time float64) {
	timeX := math.Abs((newPos.X - d.DroneObject.Pos.X) / speed.VX)
	timeY := math.Abs((newPos.Y - d.DroneObject.Pos.Y) / speed.VY)
	timeZ := math.Abs((newPos.Z - d.DroneObject.Pos.Z) / speed.VZ)
	return math.Max(timeX, math.Max(timeY, timeZ))
}

var samplePosition = Position{5, 4, 6}

var sampleSpeed = Speed{2, 1, -1}

var sampleDimension = Dimensions{1, 1, 1}

var sampleDroneType = DroneType{"type1", "Simple sample drone type", sampleDimension, Dimensions{10, 10, 10}, Speed{10, 10, 10}}

var sampleDroneObject = DroneObject{samplePosition, sampleDroneType, sampleSpeed}

var sampleDrone = Drone{"drone1", "localhost:1111", "learner", sampleDroneObject}