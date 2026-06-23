package com.javiermuredev.investlab.repository;

import com.javiermuredev.investlab.model.SavedSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSimulationRepository extends JpaRepository<SavedSimulation, Long> {

    List<SavedSimulation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<SavedSimulation> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
