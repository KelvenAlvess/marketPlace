package com.example.marketPlace.configurations;

import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import com.example.marketPlace.model.enums.UserRole;
import com.example.marketPlace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Set;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;

    private final PasswordEncoder passwordEncoder;

    @Override

    public void run(String... args) {
        try {
            log.info("Iniciando carga de dados...");


            cartItemRepository.deleteAll();

            orderRepository.deleteAll();
            productRepository.deleteAll();
            categoryRepository.deleteAll();
            userRepository.deleteAll();

            log.info("Banco limpo com sucesso!");

            User admin = new User();
            admin.setUsername("Admin Master");
            admin.setEmail("kelvengomes123321@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setCpf("00000000000");
            admin.setPhoneNumber("11999999999");
            admin.setAddress("Headquarters");
            admin.setRoles(Set.of(UserRole.ADMIN, UserRole.BUYER));
            admin.setCreatedAt(LocalDateTime.now());

            User buyer = new User();
            buyer.setUsername("Cliente Feliz");
            buyer.setEmail("cliente@marketplace.com");
            buyer.setPassword(passwordEncoder.encode("123456"));
            buyer.setCpf("11111111111");
            buyer.setPhoneNumber("11988888888");
            buyer.setAddress("Rua das Flores, 123 - São Paulo/SP");
            buyer.setRoles(Set.of(UserRole.BUYER));
            buyer.setCreatedAt(LocalDateTime.now());

            userRepository.saveAll(Arrays.asList(admin, buyer));
            log.info("Usuários criados!");

            Category catEletronicos = new Category();
            catEletronicos.setName("Eletrônicos");
            catEletronicos.setDescription("Gadgets e dispositivos");

            Category catRoupas = new Category();
            catRoupas.setName("Roupas");
            catRoupas.setDescription("Moda masculina e feminina");

            Category catLivros = new Category();
            catLivros.setName("Livros");
            catLivros.setDescription("Educação e entretenimento");

            Category catCasa = new Category();
            catCasa.setName("Casa");
            catCasa.setDescription("Decoração e móveis");

            Category catGamer = new Category();
            catGamer.setName("Gamer");
            catGamer.setDescription("Acessórios para jogos");

            categoryRepository.saveAll(Arrays.asList(catEletronicos, catRoupas, catLivros, catCasa, catGamer));
            log.info("Categorias criadas!");

            Product p1 = new Product();
            p1.setProductName("Notebook Dell Inspiron");
            p1.setDescription("Intel Core i5, 8GB RAM, SSD 256GB, Tela 15.6 Full HD.");
            p1.setProductPrice(BigDecimal.valueOf(3500.00));
            p1.setStockQuantity(10);
            p1.setCategory(catEletronicos);
            p1.setSeller(admin);
            p1.setImage("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80");
            p1.setWeight(2.5); p1.setHeight(8); p1.setWidth(35); p1.setLength(45);

            Product p2 = new Product();
            p2.setProductName("Smartphone Samsung Galaxy S23");
            p2.setDescription("128GB, 5G, Câmera Tripla, Processador Snapdragon.");
            p2.setProductPrice(BigDecimal.valueOf(4200.00));
            p2.setStockQuantity(15);
            p2.setCategory(catEletronicos);
            p2.setSeller(admin);
            p2.setImage("https://images.unsplash.com/photo-1610945265078-38584e12e4c9?auto=format&fit=crop&w=800&q=80");
            p2.setWeight(0.4); p2.setHeight(5); p2.setWidth(10); p2.setLength(18);

            Product p3 = new Product();
            p3.setProductName("Smart TV LG 55 4K");
            p3.setDescription("Tecnologia OLED, Inteligência Artificial ThinQ AI.");
            p3.setProductPrice(BigDecimal.valueOf(2800.00));
            p3.setStockQuantity(5);
            p3.setCategory(catEletronicos);
            p3.setSeller(admin);
            p3.setImage("https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80");
            p3.setWeight(18.0); p3.setHeight(80); p3.setWidth(15); p3.setLength(120);

            Product p4 = new Product();
            p4.setProductName("Camiseta Básica Branca");
            p4.setDescription("100% Algodão, corte slim fit, super confortável.");
            p4.setProductPrice(BigDecimal.valueOf(49.90));
            p4.setStockQuantity(100);
            p4.setCategory(catRoupas);
            p4.setSeller(admin);
            p4.setImage("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80");
            p4.setWeight(0.2); p4.setHeight(2); p4.setWidth(20); p4.setLength(25);

            Product p5 = new Product();
            p5.setProductName("Tênis Esportivo Running");
            p5.setDescription("Amortecimento de alta performance para corridas.");
            p5.setProductPrice(BigDecimal.valueOf(299.90));
            p5.setStockQuantity(30);
            p5.setCategory(catRoupas);
            p5.setSeller(admin);
            p5.setImage("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80");
            p5.setWeight(0.9); p5.setHeight(12); p5.setWidth(20); p5.setLength(32);

            Product p6 = new Product();
            p6.setProductName("O Senhor dos Anéis: A Sociedade do Anel");
            p6.setDescription("Edição de luxo capa dura, J.R.R. Tolkien.");
            p6.setProductPrice(BigDecimal.valueOf(89.90));
            p6.setStockQuantity(50);
            p6.setCategory(catLivros);
            p6.setSeller(admin);
            p6.setImage("https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80");
            p6.setWeight(1.2); p6.setHeight(4); p6.setWidth(16); p6.setLength(23);

            Product p7 = new Product();
            p7.setProductName("Código Limpo");
            p7.setDescription("Habilidades Práticas do Agile Software, Robert C. Martin.");
            p7.setProductPrice(BigDecimal.valueOf(75.00));
            p7.setStockQuantity(20);
            p7.setCategory(catLivros);
            p7.setSeller(admin);
            p7.setImage("https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80");
            p7.setWeight(0.6); p7.setHeight(3); p7.setWidth(17); p7.setLength(24);

            Product p8 = new Product();
            p8.setProductName("Sofá Retrátil 3 Lugares");
            p8.setDescription("Tecido Suede aveludado, cor cinza, muito confortável.");
            p8.setProductPrice(BigDecimal.valueOf(1800.00));
            p8.setStockQuantity(3);
            p8.setCategory(catCasa);
            p8.setSeller(admin);
            p8.setImage("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80");
            p8.setWeight(50.0); p8.setHeight(90); p8.setWidth(90); p8.setLength(100);

            Product p9 = new Product();
            p9.setProductName("Luminária de Mesa Industrial");
            p9.setDescription("Design moderno em metal preto, ideal para home office.");
            p9.setProductPrice(BigDecimal.valueOf(120.00));
            p9.setStockQuantity(15);
            p9.setCategory(catCasa);
            p9.setSeller(admin);
            p9.setImage("https://images.unsplash.com/photo-1507473883581-c01599505222?auto=format&fit=crop&w=800&q=80");
            p9.setWeight(1.5); p9.setHeight(30); p9.setWidth(20); p9.setLength(20);

            Product p10 = new Product();
            p10.setProductName("Cadeira Gamer RGB");
            p10.setDescription("Ergonômica, reclinável, com iluminação LED controlável.");
            p10.setProductPrice(BigDecimal.valueOf(1200.00));
            p10.setStockQuantity(8);
            p10.setCategory(catGamer);
            p10.setSeller(admin);
            p10.setImage("https://images.unsplash.com/photo-1598550476439-c9483294608c?auto=format&fit=crop&w=800&q=80");
            p10.setWeight(18.0); p10.setHeight(60); p10.setWidth(30); p10.setLength(60);

            Product p11 = new Product();
            p11.setProductName("Headset Gamer Surround 7.1");
            p11.setDescription("Cancelamento de ruído, microfone de alta precisão.");
            p11.setProductPrice(BigDecimal.valueOf(350.00));
            p11.setStockQuantity(25);
            p11.setCategory(catGamer);
            p11.setSeller(admin);
            p11.setImage("https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80");
            p11.setWeight(0.5); p11.setHeight(10); p11.setWidth(20); p11.setLength(25);

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11));

            log.info("SUCESSO: Produtos carregados!");

        } catch (Exception e) {
            log.error("ERRO GRAVE ao inicializar dados: ", e);
        }
    }
}