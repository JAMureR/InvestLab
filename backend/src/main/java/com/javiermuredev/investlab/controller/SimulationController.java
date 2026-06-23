package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.dto.SimulationRequest;
import com.javiermuredev.investlab.dto.SimulationResponse;
import com.javiermuredev.investlab.model.User;
import com.javiermuredev.investlab.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulations")
@Tag(name = "Simulaciones", description = "CRUD de simulaciones guardadas por el usuario")
@SecurityRequirement(name = "bearerAuth")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping
    @Operation(summary = "Guardar simulación", description = "Persiste una nueva configuración de simulación en el historial del usuario")
    public ResponseEntity<SimulationResponse> saveSimulation(
            @Valid @RequestBody SimulationRequest request,
            @AuthenticationPrincipal User user) {
        SimulationResponse response = simulationService.saveSimulation(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar simulaciones", description = "Devuelve todas las simulaciones guardadas del usuario autenticado")
    public ResponseEntity<List<SimulationResponse>> getUserSimulations(
            @AuthenticationPrincipal User user) {
        List<SimulationResponse> simulations = simulationService.getUserSimulations(user.getId());
        return ResponseEntity.ok(simulations);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar simulación", description = "Modifica una simulación existente del usuario")
    public ResponseEntity<SimulationResponse> updateSimulation(
            @PathVariable Long id,
            @Valid @RequestBody SimulationRequest request,
            @AuthenticationPrincipal User user) {
        SimulationResponse response = simulationService.updateSimulation(id, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar simulación", description = "Elimina una simulación del historial del usuario")
    public ResponseEntity<Map<String, String>> deleteSimulation(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        simulationService.deleteSimulation(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Simulación eliminada correctamente"));
    }
}
