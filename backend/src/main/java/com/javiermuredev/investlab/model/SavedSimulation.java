package com.javiermuredev.investlab.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_simulations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Tipo de simulador: "simulador", "indexados", "remuneradas" */
    @NotBlank
    @Column(nullable = false)
    private String simulationType;

    @NotNull
    @Positive
    private Double capitalInicial;

    @NotNull
    private Double aportacionMensual;

    @NotNull
    @Positive
    private Integer tiempoAnios;

    @NotNull
    private Double interesAnual;

    @NotNull
    private Double inflacionAnual;

    @NotNull
    private Double volatilidadAnual;

    private String perfilRiesgo;

    /** ID del fondo seleccionado (solo para tipo "indexados") */
    private String selectedFundId;

    /** ID de la cuenta seleccionada (solo para tipo "remuneradas") */
    private String selectedAccountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
