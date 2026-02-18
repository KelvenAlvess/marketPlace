package com.example.marketPlace.service;

import com.example.marketPlace.dto.ShippingOptionDTO;
import com.example.marketPlace.dto.melhorenvio.MelhorEnvioRequestDTO;
import com.example.marketPlace.dto.melhorenvio.MelhorEnvioResponseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingService {

    @Value("${melhorenvio.url}")
    private String apiUrl;

    @Value("${melhorenvio.token}")
    private String apiToken;

    @Value("${melhorenvio.cep.origem}")
    private String cepOrigem;

    private final ObjectMapper objectMapper;

    public List<ShippingOptionDTO> calculateOptions(String cepDestino) {
        String cleanCep = cepDestino.replace("-", "").trim();
        List<ShippingOptionDTO> options = new ArrayList<>();

        if (cleanCep.length() != 8) return options;

        try {
            // 1. Monta o Payload da Requisição
            MelhorEnvioRequestDTO requestPayload = createPayload(cleanCep);
            String jsonBody = objectMapper.writeValueAsString(requestPayload);

            // 2. Prepara a chamada HTTP
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("Authorization", "Bearer " + apiToken) // Autenticação
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            // 3. Envia e recebe
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // 4. Deserializa a resposta (Lista de opções)
                List<MelhorEnvioResponseDTO> meOptions = objectMapper.readValue(
                        response.body(),
                        new TypeReference<List<MelhorEnvioResponseDTO>>() {}
                );

                // 5. Converte para o DTO do nosso Frontend
                for (MelhorEnvioResponseDTO meOption : meOptions) {
                    if (meOption.error() != null) continue; // Pula opções indisponíveis

                    // Formata o nome: "Jadlog .Package (Jadlog)" ou "SEDEX (Correios)"
                    String carrierName = meOption.company().name();
                    String serviceName = meOption.name() + " (" + carrierName + ")";

                    options.add(new ShippingOptionDTO(
                            serviceName,
                            BigDecimal.valueOf(meOption.customPrice()), // Preço final com desconto
                            meOption.deliveryTime()
                    ));
                }
            } else {
                log.error("Erro Melhor Envio: " + response.body());
            }

        } catch (Exception e) {
            log.error("Falha ao calcular frete no Melhor Envio", e);
            // Fallback silencioso ou lançar exceção customizada
        }

        return options;
    }

    private MelhorEnvioRequestDTO createPayload(String cepDestino) {
        // Origem e Destino
        var from = new MelhorEnvioRequestDTO.Location(cepOrigem);
        var to = new MelhorEnvioRequestDTO.Location(cepDestino);

        // Simulando um produto (Num app real, viria do Carrinho do BD)
        // Para calcular Correios, o peso deve ser > 0
        var produtoExemplo = new MelhorEnvioRequestDTO.ProductPayload(
                "ID_PRODUTO",
                20, // largura cm
                20, // altura cm
                20, // comprimento cm
                1.0, // peso kg
                50.0, // valor seguro R$
                1 // quantidade
        );

        return new MelhorEnvioRequestDTO(from, to, Collections.singletonList(produtoExemplo));
    }
}