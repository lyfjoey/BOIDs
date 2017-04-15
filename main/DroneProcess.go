package main

import (
    "fmt"
    "net/http"
    "log"
    "strconv"
    "time"
)

var droneObject DroneObject
var drone Drone
var swarm map[string]Drone

func main() {

    var droneId, port, paxosRole string
    fmt.Println("Provide drone ID, port, paxosRole: ")
    fmt.Scanf("%s %s", &droneId, &port, &paxosRole)

    http.HandleFunc(DRONE_HEARTBEAT_URL, heartbeat)
    http.HandleFunc(DRONE_GET_INFO_URL, getDroneInfo)
    http.HandleFunc(DRONE_UPDATE_SWARM_INFO_URL, updateSwarmInfo)
    http.HandleFunc(DRONE_MOVE_TO_POSITION_URL, moveToPosition)
    http.HandleFunc(DRONE_ADD_DRONE_URL, addNewDroneToSwarm)

    droneObject = DroneObject{Position{0, 0, 0}, DroneType{"0", "normal", Dimensions{1, 2, 3}, Dimensions{1, 2, 3}, Speed{1, 2, 3}}, Speed{1, 2, 3}}
    drone = Drone{droneId, "localhost:" + port, paxosRole, droneObject}
    // Start the environment server on localhost port 18841 and log any errors
    log.Println("http server started on :" + port)
    err := http.ListenAndServe(":" + port, nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}

//func moveDrone(newPos Position, speed Speed) {
//    log.Println("Moving to ", newPos)
//    tX := math.Abs((newPos.X - drone.Pos.X) / speed.VX)
//    tY := math.Abs((newPos.Y - drone.Pos.Y) / speed.VY)
//    tZ := math.Abs((newPos.Z - drone.Pos.Z) / speed.VZ)
//
//    t := math.Max(tX, math.Max(tY, tZ))
//
//    for i := 0; i < int(t + 0.5); i++ {
//        drone.Pos.X += (newPos.X - drone.Pos.X) / t
//        drone.Pos.Y += (newPos.Y - drone.Pos.Y) / t
//        drone.Pos.Z += (newPos.Z - drone.Pos.Z) / t
//        time.Sleep(time.Duration(1000000000))
//    }
//}

func moveDrone(newPos Position, t float64) {
    log.Println("Moving to ", newPos)
    oldPos := droneObject.Pos
    for {
        if newPos.X == droneObject.Pos.X && newPos.Y == droneObject.Pos.Y && newPos.Z == droneObject.Pos.Z {
            break
        }
        droneObject.Pos.X += (newPos.X - oldPos.X) / t
        droneObject.Pos.Y += (newPos.Y - oldPos.Y) / t
        droneObject.Pos.Z += (newPos.Z - oldPos.Z) / t
        time.Sleep(time.Duration(1000000000))
    }
}

func heartbeat(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Write([]byte(toJsonString(drone.ID)))
}

func getDroneInfo(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Write([]byte(toJsonString(drone)))
}

func updateSwarmInfo(w http.ResponseWriter, r *http.Request) {
    //w.Header().Set("Access-Control-Allow-Origin", "*")
    //w.Write([]byte(toJsonString(drone)))
}

func moveToPosition(w http.ResponseWriter, r *http.Request) {
    values := r.URL.Query()
    x, _ := strconv.ParseFloat(values.Get("X"), 64)
    y, _ := strconv.ParseFloat(values.Get("Y"), 64)
    z, _ := strconv.ParseFloat(values.Get("Z"), 64)
    moveDrone(Position{x, y, z}, 20)
}

func addNewDroneToSwarm(w http.ResponseWriter, r *http.Request) {
    address := r.URL.Query() .Get("address")
    newDrone, err := getDroneFromServer(address)
    if err != nil {
        log.Println("Error! ", err)
    } else {
        swarm[newDrone.ID] = newDrone
    }
}
