package com.javiermuredev.investlab.repository;

import com.javiermuredev.investlab.model.IndexFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IndexFundRepository extends JpaRepository<IndexFund, String> {
}
