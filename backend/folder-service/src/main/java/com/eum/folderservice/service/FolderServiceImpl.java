package com.eum.folderservice.service;

import com.eum.folderservice.domain.Folder;
import com.eum.folderservice.dto.request.CreateFolderRequestDTO;
import com.eum.folderservice.dto.request.ModifyTitleRequestDTO;
import com.eum.folderservice.dto.response.FolderResponseDTO;
import com.eum.folderservice.dto.response.SubFolderResponseDTO;
import com.eum.folderservice.repository.FolderRepository;
import com.eum.folderservice.common.exception.ErrorCode;
import com.eum.folderservice.common.exception.FolderException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;

    @Override
    @Transactional
    public FolderResponseDTO createFolder(CreateFolderRequestDTO createFolderDTO) {
        Folder newFolder = null;

        // 최상위 폴더인 경우
        if (createFolderDTO.getParentId() == 0) {
            newFolder = createFolderDTO.from(null);
        }
        // 상위 폴더가 존재하는 경우
        else {
            Folder parentFolder = findFolderByIdAndMemberId(createFolderDTO.getParentId(), createFolderDTO.getMemberId());

            for(Folder subFolder : parentFolder.getSubFolders()) {
                if(subFolder.getTitle().equals(createFolderDTO.getTitle())) {
                    throw new FolderException(ErrorCode.FOLDER_ALREADY_EXISTS_ERROR);
                }
            }

            newFolder = createFolderDTO.from(parentFolder);
            parentFolder.addChildFolder(newFolder);
        }

        Folder savedFolder = folderRepository.save(newFolder);

        return FolderResponseDTO.of(savedFolder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubFolderResponseDTO> getSubFolders(Long folderId, Long memberId) {
        Folder folder = findFolderByIdAndMemberId(folderId, memberId);
        return folder.getSubFolders().stream().map(SubFolderResponseDTO::of).toList();
    }

    @Override
    @Transactional
    public FolderResponseDTO modifyFolderTitle(ModifyTitleRequestDTO requestDTO, Long memberId) {
        Folder folder = findFolderByIdAndMemberId(requestDTO.getFolderId(), memberId);
        folder.modifyTitle(requestDTO.getTitle());
        return FolderResponseDTO.of(folder);
    }

    @Transactional
    protected Folder findFolderByIdAndMemberId(Long folderId, Long memberId) {
        return folderRepository.findByIdAndMemberId(folderId, memberId)
                .orElseThrow(() -> new FolderException(ErrorCode.FOLDER_NOT_FOUND_ERROR));
    }
}
