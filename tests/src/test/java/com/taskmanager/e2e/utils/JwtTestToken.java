package com.taskmanager.e2e.utils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * Minimal RS256 signer used only by the forged-token regression test. It reads
 * the real backend key from disk and proves that even a signing-key holder
 * cannot cross the session/subject boundary.
 */
public final class JwtTestToken {

    private JwtTestToken() {
    }

    public static String sign(Path privateKeyPath, String subject, String sessionId, Duration ttl) {
        try {
            String pem = Files.readString(privateKeyPath, StandardCharsets.UTF_8)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] der = Base64.getDecoder().decode(pem);
            PrivateKey privateKey = KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(der));

            Instant now = Instant.now();
            String header = base64Url("{\"alg\":\"RS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
            String payload = base64Url("""
                    {"sub":%s,"sid":%s,"type":"access","iat":%d,"exp":%d}
                    """.formatted(json(subject), json(sessionId), now.getEpochSecond(),
                    now.plus(ttl).getEpochSecond()).getBytes(StandardCharsets.UTF_8));

            String signingInput = header + "." + payload;
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey);
            signature.update(signingInput.getBytes(StandardCharsets.US_ASCII));
            return signingInput + "." + base64Url(signature.sign());
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign JWT test token", e);
        }
    }

    private static String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static String json(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
}
