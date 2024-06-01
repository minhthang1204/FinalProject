package net.maslyna.file.service.impl;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.maslyna.file.exception.GlobalFileServiceException;
import net.maslyna.file.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {
//    private final Storage storage;
//    @Value("${gcp.bucket.name}")
//    private String bucketName;

//    @Override
//    public Blob upload(String filename, InputStream stream, String contentType) {
//        Bucket bucket = storage.get(bucketName);
//        Blob blob = bucket.create(filename, stream, contentType);
//        log.info("file was saved, filename = '{}'", blob.getName());
//        return blob;
//    }

    @Value("${spring.application.local.storage.path}")
    private String localStoragePath;

    @Override
    public String upload(String filename, InputStream stream, String contentType) {
        File localFile = new File(localStoragePath + File.separator + filename);
        try (FileOutputStream outputStream = new FileOutputStream(localFile)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = stream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            log.info("File was saved locally, filename = '{}'", localFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to save file locally, filename = '{}'", filename, e);
            throw new GlobalFileServiceException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save file locally");
        }
        return localFile.getAbsolutePath();
    }

//    @Override
//    public boolean delete(String filename) {
//        return storage.delete(BlobId.of(bucketName, filename));
//    }
//
//    @Override
//    public String getLink(String filename) {
//        Blob blob = storage.get(bucketName).get(filename);
//        if (blob != null) {
//            return blob.getMediaLink();
//        }
//        return null;
//    }

    @Override
    public boolean delete(String filename) {
        File localFile = new File(localStoragePath + File.separator + filename);
        return localFile.exists() && localFile.delete();
    }

    @Override
    public String getLink(String filename) {
        File localFile = new File(localStoragePath + File.separator + filename);
        return localFile.exists() ? localFile.getAbsolutePath() : null;
    }
}
