package com.example.marketPlace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentReconciler {

    private final PaymentService paymentService;

    /**
     * Executa a cada 5 minutos (300.000 ms)
     * Verifica se existem pagamentos "presos" no status PENDING e tenta atualizar.
     */
    @Scheduled(fixedDelay = 300000)
    public void runReconciliation() {
        log.info("Iniciando Job de Reconciliação de Pagamentos...");
        try {
            paymentService.reconcilePendingPayments();
        } catch (Exception e) {
            log.error("Erro durante a reconciliação agendada", e);
        }
        log.info("Job de Reconciliação finalizado.");
    }
}