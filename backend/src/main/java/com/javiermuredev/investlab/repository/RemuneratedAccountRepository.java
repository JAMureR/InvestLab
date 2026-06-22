package com.javiermuredev.investlab.repository;

import com.javiermuredev.investlab.model.RemuneratedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RemuneratedAccountRepository extends JpaRepository<RemuneratedAccount, String> {
}
