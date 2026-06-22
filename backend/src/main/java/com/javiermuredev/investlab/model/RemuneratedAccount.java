package com.javiermuredev.investlab.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "remunerated_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemuneratedAccount {

    @Id
    private String id = UUID.randomUUID().toString();
    
    private String name;
    private Double percentageTAE;
    private String payoutFrequency;
    private String liquidity;
    private Integer riskRating;
    private String logoUrl;
    private String conditions;
}
