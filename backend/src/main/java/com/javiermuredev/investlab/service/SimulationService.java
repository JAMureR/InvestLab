package com.javiermuredev.investlab.service;

import com.javiermuredev.investlab.dto.SimulationRequest;
import com.javiermuredev.investlab.dto.SimulationResponse;
import com.javiermuredev.investlab.model.SavedSimulation;
import com.javiermuredev.investlab.model.User;
import com.javiermuredev.investlab.repository.SavedSimulationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SimulationService {

    private final SavedSimulationRepository simulationRepository;

    public SimulationService(SavedSimulationRepository simulationRepository) {
        this.simulationRepository = simulationRepository;
    }

    /**
     * Guarda una nueva simulación asociada al usuario autenticado.
     */
    public SimulationResponse saveSimulation(SimulationRequest request, User user) {
        SavedSimulation simulation = new SavedSimulation();
        simulation.setName(request.getName());
        simulation.setSimulationType(request.getSimulationType());
        simulation.setCapitalInicial(request.getCapitalInicial());
        simulation.setAportacionMensual(request.getAportacionMensual());
        simulation.setTiempoAnios(request.getTiempoAnios());
        simulation.setInteresAnual(request.getInteresAnual());
        simulation.setInflacionAnual(request.getInflacionAnual());
        simulation.setVolatilidadAnual(request.getVolatilidadAnual());
        simulation.setPerfilRiesgo(request.getPerfilRiesgo());
        simulation.setSelectedFundId(request.getSelectedFundId());
        simulation.setSelectedAccountId(request.getSelectedAccountId());
        simulation.setUser(user);

        SavedSimulation saved = simulationRepository.save(simulation);
        return mapToResponse(saved);
    }

    /**
     * Devuelve todas las simulaciones del usuario, ordenadas por la más reciente.
     */
    public List<SimulationResponse> getUserSimulations(Long userId) {
        return simulationRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Elimina una simulación comprobando que pertenece al usuario autenticado.
     */
    public void deleteSimulation(Long simulationId, Long userId) {
        SavedSimulation simulation = simulationRepository.findByIdAndUserId(simulationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Simulación no encontrada o no pertenece al usuario"));
        simulationRepository.delete(simulation);
    }

    /**
     * Actualiza una simulación existente comprobando propiedad del usuario.
     */
    public SimulationResponse updateSimulation(Long simulationId, SimulationRequest request, User user) {
        SavedSimulation simulation = simulationRepository.findByIdAndUserId(simulationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Simulación no encontrada o no pertenece al usuario"));

        simulation.setName(request.getName());
        simulation.setSimulationType(request.getSimulationType());
        simulation.setCapitalInicial(request.getCapitalInicial());
        simulation.setAportacionMensual(request.getAportacionMensual());
        simulation.setTiempoAnios(request.getTiempoAnios());
        simulation.setInteresAnual(request.getInteresAnual());
        simulation.setInflacionAnual(request.getInflacionAnual());
        simulation.setVolatilidadAnual(request.getVolatilidadAnual());
        simulation.setPerfilRiesgo(request.getPerfilRiesgo());
        simulation.setSelectedFundId(request.getSelectedFundId());
        simulation.setSelectedAccountId(request.getSelectedAccountId());

        SavedSimulation updated = simulationRepository.save(simulation);
        return mapToResponse(updated);
    }

    private SimulationResponse mapToResponse(SavedSimulation sim) {
        SimulationResponse response = new SimulationResponse();
        response.setId(sim.getId());
        response.setName(sim.getName());
        response.setSimulationType(sim.getSimulationType());
        response.setCapitalInicial(sim.getCapitalInicial());
        response.setAportacionMensual(sim.getAportacionMensual());
        response.setTiempoAnios(sim.getTiempoAnios());
        response.setInteresAnual(sim.getInteresAnual());
        response.setInflacionAnual(sim.getInflacionAnual());
        response.setVolatilidadAnual(sim.getVolatilidadAnual());
        response.setPerfilRiesgo(sim.getPerfilRiesgo());
        response.setSelectedFundId(sim.getSelectedFundId());
        response.setSelectedAccountId(sim.getSelectedAccountId());
        response.setCreatedAt(sim.getCreatedAt());
        response.setUpdatedAt(sim.getUpdatedAt());
        return response;
    }
}
