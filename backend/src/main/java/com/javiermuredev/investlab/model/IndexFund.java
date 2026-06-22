package com.javiermuredev.investlab.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "index_funds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IndexFund {

    @Id
    private String id = UUID.randomUUID().toString();
    
    private String name;
    private String ticker;
    private String isin;
    private Double historicalReturn1Y;
    private Double historicalReturn5Y;
    private Integer riskRating;
    private Double ter;
    private String region;
    private String category;
    private Double volatility;
    private Double beta;
}
